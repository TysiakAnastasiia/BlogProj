import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import defaultImage from "../styles/wed.jpg";
import axios from "axios";

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [contentType, setContentType] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: "post", title: "", content: "", genre: "", year: "", image: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  // Отримуємо користувача з localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  // Отримуємо дані з бекенду
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = contentType === "posts"
          ? "http://localhost:5000/api/posts"
          : "http://localhost:5000/api/movies";
        const res = await axios.get(url);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [contentType]);

  // Фільтруємо по типу і пошуку
  const filteredPosts = posts.filter(post =>
    Object.values(post).some(value =>
      value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // ✅ ВИПРАВЛЕНО: Відправляємо дані на сервер
  const handleAddItem = async () => {
    if (!newItem.title) {
      alert("Title is required!");
      return;
    }

    if (!user || !user.id) {
      alert("You must be logged in to create content!");
      return;
    }

    try {
      if (contentType === "posts") {
        // Створюємо пост
        const postData = {
          title: newItem.title,
          content: newItem.content || "",
          image: newItem.image || "",
          user_id: user.id
        };

        console.log("Sending post data:", postData);

        const res = await axios.post("http://localhost:5000/api/posts", postData);
        
        console.log("Post created:", res.data);

        // Додаємо новий пост в локальний стейт
        setPosts([{ ...postData, id: res.data.postId, created_at: new Date() }, ...posts]);
        
      } else {
        // Створюємо фільм
        const movieData = {
          title: newItem.title,
          genre: newItem.genre || "",
          year: newItem.year || null,
          image_url: newItem.image || "",
          created_by: user.id
        };

        console.log("Sending movie data:", movieData);

        const res = await axios.post("http://localhost:5000/api/movies", movieData);
        
        console.log("Movie created:", res.data);

        // Додаємо новий фільм в локальний стейт
        setPosts([{ ...movieData, id: res.data.movieId, created_at: new Date() }, ...posts]);
      }

      // Очищаємо форму і закриваємо модалку
      setNewItem({ type: contentType === "posts" ? "post" : "movie", title: "", content: "", genre: "", year: "", image: null });
      setAddModal(false);
      
      alert(`${contentType === "posts" ? "Post" : "Movie"} created successfully!`);

    } catch (err) {
      console.error("Error creating item:", err);
      alert(`Error creating ${contentType === "posts" ? "post" : "movie"}: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const handleAddComment = (id, comment) => {
    if (!comment) return;
    setPosts(posts.map(p => p.id === id ? { ...p, comments: [...(p.comments || []), comment] } : p));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewItem(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{contentType === "posts" ? "Posts" : "Movies"}</h1>
        <button className="add-post-button" onClick={() => {
          setAddModal(true); 
          setNewItem(prev => ({ ...prev, type: contentType === "posts" ? "post" : "movie" }));
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
        {filteredPosts.map(post => (
          <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
            <img src={post.image || post.image_url || defaultImage} alt={post.title} className="post-image" />
            {viewMode === "list" && (
              <div className="post-caption">
                <strong>{post.title}</strong>{post.genre ? ` (${post.year}) - ${post.genre}` : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="post-modal" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedPost(null)}>&times;</span>
            <img src={selectedPost.image || selectedPost.image_url || defaultImage} alt={selectedPost.title} />
            <div className="modal-body">
              <h3>{selectedPost.title}</h3>
              {selectedPost.genre && <p>Genre: {selectedPost.genre} | Year: {selectedPost.year}</p>}
              {selectedPost.content && <p>{selectedPost.content}</p>}
              <div className="post-interactions">
                <button onClick={() => handleLike(selectedPost.id)}>❤️ {selectedPost.likes || 0}</button>
              </div>
              <div className="post-comments">
                {(selectedPost.comments || []).map((c, i) => <div key={i}>• {c}</div>)}
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

      {addModal && (
        <div className="post-modal" onClick={() => setAddModal(false)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setAddModal(false)}>&times;</span>
            <div className="modal-body">
              <h3>Add New {contentType === "posts" ? "Post" : "Movie"}</h3>
              <input 
                type="text" 
                placeholder="Title *" 
                value={newItem.title} 
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))} 
              />
              {contentType === "posts" && (
                <textarea 
                  placeholder="Content" 
                  value={newItem.content} 
                  onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                  rows="4"
                />
              )}
              {contentType === "movies" && (
                <>
                  <input 
                    type="text" 
                    placeholder="Genre" 
                    value={newItem.genre} 
                    onChange={(e) => setNewItem(prev => ({ ...prev, genre: e.target.value }))} 
                  />
                  <input 
                    type="number" 
                    placeholder="Year" 
                    value={newItem.year} 
                    onChange={(e) => setNewItem(prev => ({ ...prev, year: e.target.value }))} 
                  />
                </>
              )}
              <label className="add-image-label">
                {newItem.image ? "Change Image" : "Select Image (Optional)"}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
              {newItem.image && <img src={newItem.image} alt="Preview" className="image-preview" />}
              <button className="add-post-button" onClick={handleAddItem}>
                Add {contentType === "posts" ? "Post" : "Movie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;