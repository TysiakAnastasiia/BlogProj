import React, { useState, useEffect, useCallback } from "react";
import "../styles/Dashboard.css";
import defaultImage from "../styles/def.png"; 
import api from "../api"; 
import Header from "./Header";
import "../styles/Header.css";


// --- НОВИЙ КОМПОНЕНТ ДЛЯ ALERT/TOAST ---
const CustomAlert = ({ message, type, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        // Викликаємо onClose, щоб очистити стан у батьківському компоненті
        setTimeout(onClose, 400); 
      }, 3000); // Показуємо 3 секунди
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`app-alert ${type} ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
};

// --- НОВИЙ КОМПОНЕНТ ДЛЯ CONFIRM ---
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="confirm-modal-overlay">
    <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
      <h4>{message}</h4>
      <div className="confirm-actions">
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-confirm" onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  </div>
);


function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [contentType, setContentType] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [itemInEditor, setItemInEditor] = useState({ type: "post", title: "", content: "", genre: "", year: "", image: null });
  const [user, setUser] = useState(null);
  const [openOptionsPostId, setOpenOptionsPostId] = useState(null);
  const [isModalOptionsOpen, setIsModalOptionsOpen] = useState(false);
  const [likedByMe, setLikedByMe] = useState(new Set());

  const [searchQuery, setSearchQuery] = useState(""); 
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); 
  
  // НОВІ СТАНИ для Alert/Confirm
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [confirmAction, setConfirmAction] = useState(null); // { message, handler, id, itemType/commentId }


  const getItemType = () => contentType === "posts" ? "post" : "movie";
  
  // Функція для показу Alert
  const showAlert = useCallback((message, type = 'success') => {
    setAlertType(type);
    setAlertMessage(message);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (userData && token) {
      setUser({ ...userData, token: token });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); 

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]); 

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; 
      
      try {
        const apiFunction = contentType === "posts" ? api.getPosts : api.getMovies;
        const res = await apiFunction(user.id, debouncedSearchQuery); 
        setPosts(res);
        
        const initialLikes = new Set(
          res
            .filter(p => p.likedByMe) 
            .map(p => p.id)
        );
        setLikedByMe(initialLikes);

      } catch (err) {
        console.error("Error fetching data:", err);
        showAlert(`Error loading ${contentType}: ${err.message}`, 'error');
      }
    };
    
    fetchData();
  }, [contentType, user, debouncedSearchQuery, showAlert]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".options-button") && !event.target.closest(".options-dropdown")) {
        setOpenOptionsPostId(null);
        setIsModalOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const resetEditor = () => {
    setItemInEditor({ type: contentType === "posts" ? "post" : "movie", title: "", content: "", genre: "", year: "", image: null });
  };

  const handleSaveItem = async () => {
    if (!itemInEditor.title) {
      showAlert("Title is required!", 'error');
      return;
    }
    if (!user || !user.token) { 
      showAlert("You must be logged in!", 'error');
      return;
    }

    const isEditing = !!itemInEditor.id;
    let itemData;
    let apiFunction;
    let updateId = isEditing ? itemInEditor.id : null;

    if (contentType === "posts") {
      itemData = {
        title: itemInEditor.title,
        content: itemInEditor.content || "",
        image: itemInEditor.image || "",
        user_id: user.id 
      };
      apiFunction = isEditing ? api.updatePost : api.createPost; 
    } else { 
      itemData = {
        title: itemInEditor.title,
        genre: itemInEditor.genre || "",
        year: itemInEditor.year || null,
        image_url: itemInEditor.image || itemInEditor.image_url || "", 
        created_by: user.id 
      };
      apiFunction = isEditing ? api.updateMovie : api.createMovie; 
    }

    try {
      if (isEditing) {
        await apiFunction(updateId, itemData, user.token);
        
        setPosts(posts.map(p => 
          p.id === updateId ? { ...p, ...itemData, image_url: itemData.image_url, image: itemData.image } : p
        ));
        
        showAlert("Item updated successfully!");
        
      } else {
        const res = await apiFunction(itemData, user.token); 
        const newItemId = res.postId || res.movieId;
        
        setPosts([{ ...itemData, id: newItemId, created_at: new Date(), likes: 0, comments: [], likedByMe: false }, ...posts]);
        
        showAlert("Item created successfully!");
      }

      resetEditor();
      setEditModal(false);

    } catch (err) {
      console.error("Error saving item:", err);
      showAlert(`Error saving: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleEditClick = (postToEdit) => {
    setContentType(postToEdit.genre ? "movies" : "posts");
    setItemInEditor({
        ...postToEdit,
        image: postToEdit.image || postToEdit.image_url
    });
    setEditModal(true);
    setOpenOptionsPostId(null);
    setIsModalOptionsOpen(false);
  };
  
  // ЗМІНЕНО: Ініціатор підтвердження видалення поста
  const initiatePostDelete = (postId, postType) => {
    const itemLabel = postType === 'posts' ? 'post' : 'movie';
    setConfirmAction({
      message: `Are you sure you want to delete this ${itemLabel}?`,
      handler: () => executeDeletePost(postId, postType),
      id: postId
    });
    setOpenOptionsPostId(null);
    setIsModalOptionsOpen(false);
  };
  
  // ЗМІНЕНО: Виконання видалення поста
  const executeDeletePost = async (postId, postType) => {
    if (!user || !user.token) { 
      showAlert("You must be logged in!", 'error');
      return;
    }

    const deleteFunction = postType === 'posts' ? api.deletePost : api.deleteMovie;
    
    try {
        await deleteFunction(postId, user.token);
        setPosts(posts.filter(p => p.id !== postId));
        
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(null);
        }
        showAlert("Item deleted successfully!");
        
    } catch (err) {
        console.error("Error deleting item:", err);
        showAlert(`Error deleting: ${err.response?.data?.message || err.message}`, 'error');
    }
    setConfirmAction(null); // Закриваємо модалку підтвердження
  };


  const handleLike = async (id) => {
    if (!user || !user.token) {
      showAlert("You must be logged in to like posts!", 'error');
      return;
    }

    const originalLikedSet = new Set(likedByMe);
    const originalPosts = [...posts]; 
    const originalSelectedPost = selectedPost ? { ...selectedPost } : null;

    const hasLiked = originalLikedSet.has(id);
    const newLikedByMe = new Set(originalLikedSet);
    
    let newLikeCount;
    const post = originalSelectedPost?.id === id ? originalSelectedPost : originalPosts.find(p => p.id === id);
    newLikeCount = hasLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1;
    
    if (hasLiked) {
      newLikedByMe.delete(id);
    } else {
      newLikedByMe.add(id);
    }

    setLikedByMe(newLikedByMe);
    setPosts(posts.map(p => p.id === id ? { ...p, likes: newLikeCount, likedByMe: !hasLiked } : p));
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost(prev => ({ ...prev, likes: newLikeCount, likedByMe: !hasLiked }));
    }

    try {
      if (hasLiked) {
        await api.removeLike(id, getItemType(), user.token);
      } else {
        await api.addLike({ post_id: id, item_type: getItemType() }, user.token); 
      }
    } catch (err) {
      console.error("Failed to update like:", err);
      showAlert("Failed to update like. Please try again.", 'error');
      
      // Відкат
      setLikedByMe(originalLikedSet); 
      setPosts(originalPosts); 
       if (selectedPost && selectedPost.id === id) {
         setSelectedPost(originalSelectedPost); 
       }
    }
  };

  const handleAddComment = async (id, commentText) => {
    if (!commentText) return;
    if (!user || !user.token) { 
      showAlert("You must be logged in to comment!", 'error');
      return;
    }

    try {
      const commentData = {
        post_id: id,
        content: commentText,
        item_type: getItemType()
      };

      const newComment = await api.addComment(commentData, user.token); 

      setPosts(posts.map(p => 
        p.id === id ? { ...p, comments: [...(p.comments || []), newComment] } : p
      ));

      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(prev => ({
          ...prev,
          comments: [...(prev.comments || []), newComment]
        }));
      }

    } catch (err) {
      console.error("Error adding comment:", err);
      showAlert(`Error adding comment: ${err.response?.data?.message || err.message}`, 'error');
    }
  };
  
  // ЗМІНЕНО: Ініціатор підтвердження видалення коментаря
  const initiateCommentDelete = (commentId) => {
    setConfirmAction({
      message: "Are you sure you want to delete this comment?",
      handler: () => executeDeleteComment(commentId),
      id: commentId
    });
  };

  // ЗМІНЕНО: Виконання видалення коментаря
  const executeDeleteComment = async (commentId) => {
    if (!user || !user.token) {
      showAlert("You must be logged in!", 'error');
      return;
    }

    try {
      await api.removeComment(commentId, user.token);

      const updatedComments = selectedPost.comments.filter(c => c.id !== commentId);

      setPosts(posts.map(p => 
        p.id === selectedPost.id ? { ...p, comments: updatedComments } : p
      ));

      setSelectedPost(prev => ({
        ...prev,
        comments: updatedComments
      }));
      showAlert("Comment deleted successfully!");

    } catch (err) {
      console.error("Error deleting comment:", err);
      showAlert(`Error deleting comment: ${err.response?.data?.message || err.message}`, 'error');
    }
    setConfirmAction(null); // Закриваємо модалку підтвердження
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setItemInEditor(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Header />
      
      {/* 1. ДОДАНО: Alert/Toast компонент */}
      <CustomAlert message={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />

      {/* 2. ДОДАНО: Confirm Modal */}
      {confirmAction && (
        <ConfirmModal 
          message={confirmAction.message}
          onConfirm={() => confirmAction.handler()}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{contentType === "posts" ? "Posts" : "Movies"}</h1>
          <button className="add-post-button" onClick={() => {
            resetEditor();
            setEditModal(true);
            setItemInEditor(prev => ({ ...prev, type: getItemType() }));
          }}>
            + Add {contentType === "posts" ? "Post" : "Movie"}
          </button>
        </div>

        <div className="content-type-toggle">
          <button className={contentType === "posts" ? "active" : ""} onClick={() => setContentType("posts")}>Posts</button>
          <button className={contentType === "movies" ? "active" : ""} onClick={() => setContentType("movies")}>Movies</button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder={`Search ${contentType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="view-mode-toggle">
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
          <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
        </div>

        <div className={`posts-container ${viewMode}`}>
          {posts.map(post => (
            <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
              
              <button className="options-button" onClick={(e) => {
                e.stopPropagation();
                setOpenOptionsPostId(openOptionsPostId === post.id ? null : post.id);
              }}>
                &#8942;
              </button>

              {openOptionsPostId === post.id && (
                <div className="options-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEditClick(post)}>Edit</button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      initiatePostDelete(post.id, post.genre ? "movies" : "posts"); // ЗМІНЕНО
                    }} 
                    className="delete"
                  >
                    Delete
                  </button>
                </div>
              )}
              
              <img src={post.image || post.image_url || defaultImage} alt={post.title} className="post-image" />
              
              <div className="post-caption">
                <strong>{post.title}</strong>
                {viewMode === "list" && post.genre ? ` (${post.year}) - ${post.genre}` : ""}
              </div>
            </div>
          ))}
        </div>

        {selectedPost && (
          <div className="post-modal" onClick={() => setSelectedPost(null)}>
            <div className="post-modal-content" onClick={e => e.stopPropagation()}>
              
              <img src={selectedPost.image || selectedPost.image_url || defaultImage} alt={selectedPost.title} className="post-modal-image" />
              
              <div className="modal-body">
                <span className="modal-close" onClick={() => setSelectedPost(null)}>&times;</span>

                <button className="options-button" onClick={() => setIsModalOptionsOpen(!isModalOptionsOpen)}>
                   &#8942;
                </button>

                {isModalOptionsOpen && (
                  <div className="options-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEditClick(selectedPost)}>Edit</button>
                    <button 
                      onClick={() => initiatePostDelete(selectedPost.id, selectedPost.genre ? "movies" : "posts")} // ЗМІНЕНО
                      className="delete"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <h3>{selectedPost.title}</h3>
                
                <h4 className="post-author-nickname">By: {selectedPost.author_nickname || 'Unknown'}</h4>

                {selectedPost.genre && <p>Genre: {selectedPost.genre} | Year: {selectedPost.year}</p>}
                {selectedPost.content && <p>{selectedPost.content}</p>}
                
                <div className="post-interactions">
                  <button 
                    className={likedByMe.has(selectedPost.id) ? 'liked' : ''}
                    onClick={() => handleLike(selectedPost.id)}
                  >
                    ❤️ {selectedPost.likes || 0}
                  </button>
                </div>
                
                <div className="post-comments">
                  {(selectedPost.comments || []).length > 0 && <h4>Comments:</h4>}
                  
                  <div className="comment-list">
                    {(selectedPost.comments || []).map((comment) => (
                      <div key={comment.id} className="comment-wrapper">
                        <div className="comment">
                          <span className="comment-meta">
                            <strong>{comment.author_nickname || 'User'}</strong> 
                            <span className="comment-time">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </span>
                          <p className="comment-text">{comment.content}</p>
                        </div>
                        {user && user.id === comment.author_id && (
                          <button 
                            className="comment-delete-btn"
                            onClick={() => initiateCommentDelete(comment.id)} // ЗМІНЕНО
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <input
                  type="text"
                  placeholder="Add comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment(selectedPost.id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {editModal && (
          <div className="post-modal" onClick={() => setEditModal(false)}>
            <div className="post-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-body">
                <span className="modal-close" onClick={() => setEditModal(false)}>&times;</span>
                
                <h3>{itemInEditor.id ? "Edit" : "Add New"} {contentType === "posts" ? "Post" : "Movie"}</h3>
                
                <input
                  type="text"
                  placeholder="Title *"
                  value={itemInEditor.title}
                  onChange={(e) => setItemInEditor(prev => ({ ...prev, title: e.target.value }))}
                />
                
                {contentType === "posts" && (
                  <textarea
                    placeholder="Content"
                    value={itemInEditor.content}
                    onChange={(e) => setItemInEditor(prev => ({ ...prev, content: e.target.value }))}
                    rows="4"
                  />
                )}
                
                {contentType === "movies" && (
                  <>
                    <input
                      type="text"
                      placeholder="Genre"
                      value={itemInEditor.genre}
                      onChange={(e) => setItemInEditor(prev => ({ ...prev, genre: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      value={itemInEditor.year}
                      onChange={(e) => setItemInEditor(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </>
                )}

                {itemInEditor.id && (typeof (itemInEditor.image) === 'string' && (itemInEditor.image).startsWith('http')) && (
                     <input
                        type="text"
                        placeholder="Image URL"
                        value={itemInEditor.image}
                        onChange={(e) => setItemInEditor(prev => ({ ...prev, image: e.target.value }))}
                    />
                )}

                <label className="add-image-label">
                  {itemInEditor.image ? "Change Image" : "Select Image (Optional)"}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
                
                {itemInEditor.image && <img src={itemInEditor.image} alt="Preview" className="image-preview" />}
                
                <button className="add-post-button" onClick={handleSaveItem}>
                  {itemInEditor.id ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;