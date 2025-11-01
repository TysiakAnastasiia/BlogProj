import React, { useState } from "react";
import "../styles/Dashboard.css";
import defaultImage from "../styles/wed.jpg"; // Для поста без картинки

const initialPosts = [
  { id: 1, title: "Beautiful Sunset", image: "https://i.imgur.com/WlWjXBm.png", likes: 3, comments: ["Amazing!", "Wow"] },
  { id: 2, title: "My Coffee", image: "https://i.imgur.com/f9tH8rK.png", likes: 5, comments: ["Yummy"] },
  { id: 3, title: "Nature Walk", image: "https://i.imgur.com/p8qI3cW.png", likes: 2, comments: [] },
];

function Dashboard() {
  const [posts, setPosts] = useState(initialPosts);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPost, setSelectedPost] = useState(null);
  const [addPostModal, setAddPostModal] = useState(false);

  const [newPost, setNewPost] = useState({ title: "", image: null });

  const handleAddPost = () => {
    if (newPost.title && newPost.image) {
      const newId = posts.length + 1;
      setPosts([{ ...newPost, id: newId, likes: 0, comments: [] }, ...posts]);
      setNewPost({ title: "", image: null });
      setAddPostModal(false);
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleAddComment = (postId, comment) => {
    if (!comment) return;
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewPost(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Posts</h1>
        <button className="add-post-button" onClick={() => setAddPostModal(true)}>+ Add Post</button>
      </div>

      <div className="view-mode-toggle">
        <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
        <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
      </div>

      <div className={`posts-container ${viewMode}`}>
        {posts.map(post => (
          <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
            <img src={post.image || defaultImage} alt={post.title} className="post-image" />
            {viewMode === "list" && <div className="post-caption">{post.title}</div>}
          </div>
        ))}
      </div>

      {/* View Post Modal */}
      {selectedPost && (
        <div className="post-modal" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedPost(null)}>&times;</span>
            <img src={selectedPost.image} alt={selectedPost.title} />
            <div className="modal-body">
              <h3>{selectedPost.title}</h3>
              <div className="post-interactions">
                <button onClick={() => handleLike(selectedPost.id)}>❤️ {selectedPost.likes}</button>
              </div>
              <div className="post-comments">
                {selectedPost.comments.map((c, i) => <div key={i}>• {c}</div>)}
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

      {/* Add Post Modal */}
      {addPostModal && (
        <div className="post-modal" onClick={() => setAddPostModal(false)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setAddPostModal(false)}>&times;</span>
            <div className="modal-body">
              <h3>Add New Post</h3>
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              <label className="add-image-label">
                {newPost.image ? "Change Image" : "Select Image"}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
              {newPost.image && <img src={newPost.image} alt="Preview" className="image-preview" />}
              <button className="add-post-button" onClick={handleAddPost}>Add Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
