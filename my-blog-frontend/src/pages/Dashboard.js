import React, { useState } from "react";
import "../styles/Dashboard.css";
import defaultImage from "../styles/wed.jpg";

const initialPosts = [
  { id: 1, type: "movie", title: "Beautiful Sunset", genre: "Nature", year: 2023, image: "https://i.imgur.com/WlWjXBm.png", likes: 3, comments: ["Amazing!", "Wow"] },
  { id: 2, type: "post", title: "My Coffee", image: "https://i.imgur.com/f9tH8rK.png", likes: 5, comments: ["Yummy"] },
  { id: 3, type: "movie", title: "Nature Walk", genre: "Adventure", year: 2021, image: "https://i.imgur.com/p8qI3cW.png", likes: 2, comments: [] },
];

function Dashboard() {
  const [posts, setPosts] = useState(initialPosts);
  const [viewMode, setViewMode] = useState("grid"); // grid/list
  const [contentType, setContentType] = useState("posts"); // posts/movies
  const [selectedPost, setSelectedPost] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: "post", title: "", genre: "", year: "", image: null });
  const [searchQuery, setSearchQuery] = useState("");

  // Фільтруємо по типу і пошуку
  const filteredPosts = posts
    .filter(p => (contentType === "posts" ? p.type === "post" : p.type === "movie"))
    .filter(post =>
      Object.values(post).some(value =>
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const handleAddItem = () => {
    if (newItem.title && newItem.image) {
      const newId = posts.length + 1;
      setPosts([{ ...newItem, id: newId, likes: 0, comments: [] }, ...posts]);
      setNewItem({ type: contentType === "posts" ? "post" : "movie", title: "", genre: "", year: "", image: null });
      setAddModal(false);
    }
  };

  const handleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleAddComment = (id, comment) => {
    if (!comment) return;
    setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, comment] } : p));
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
        <button className="add-post-button" onClick={() => {setAddModal(true); setNewItem(prev => ({ ...prev, type: contentType === "posts" ? "post" : "movie" }));}}>
          + Add {contentType === "posts" ? "Post" : "Movie"}
        </button>
      </div>

      {/* Тип контенту toggle */}
      <div className="content-type-toggle">
        <button className={contentType === "posts" ? "active" : ""} onClick={() => setContentType("posts")}>Posts</button>
        <button className={contentType === "movies" ? "active" : ""} onClick={() => setContentType("movies")}>Movies</button>
      </div>

      {/* Пошук */}
      <div className="search-container">
        <input
          type="text"
          placeholder={`Search ${contentType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Grid/List toggle */}
      <div className="view-mode-toggle">
        <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
        <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
      </div>

      {/* Контент */}
      <div className={`posts-container ${viewMode}`}>
        {filteredPosts.map(post => (
          <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
            <img src={post.image || defaultImage} alt={post.title} className="post-image" />
            {viewMode === "list" && (
              <div className="post-caption">
                <strong>{post.title}</strong>{post.type === "movie" ? ` (${post.year}) - ${post.genre}` : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View Modal */}
      {selectedPost && (
        <div className="post-modal" onClick={() => setSelectedPost(null)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedPost(null)}>&times;</span>
            <img src={selectedPost.image} alt={selectedPost.title} />
            <div className="modal-body">
              <h3>{selectedPost.title}</h3>
              {selectedPost.type === "movie" && <p>Genre: {selectedPost.genre} | Year: {selectedPost.year}</p>}
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

      {/* Add Modal */}
      {addModal && (
        <div className="post-modal" onClick={() => setAddModal(false)}>
          <div className="post-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setAddModal(false)}>&times;</span>
            <div className="modal-body">
              <h3>Add New {contentType === "posts" ? "Post" : "Movie"}</h3>
              <input
                type="text"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              />
              {contentType === "movies" && <>
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
              </>}
              <label className="add-image-label">
                {newItem.image ? "Change Image" : "Select Image"}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
              {newItem.image && <img src={newItem.image} alt="Preview" className="image-preview" />}
              <button className="add-post-button" onClick={handleAddItem}>Add {contentType === "posts" ? "Post" : "Movie"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
