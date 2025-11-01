import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; // CSS як у власного профілю

const postsData = [
  { id: 1, title: "Amazing Trip", image: "https://i.imgur.com/WlWjXBm.png" },
  { id: 2, title: "Delicious Food", image: "https://i.imgur.com/f9tH8rK.png" },
  { id: 3, title: "City Views", image: "https://i.imgur.com/p8qI3cW.png" },
];

function OtherProfilePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");

  const userData = {
    name: "John Doe",
    nickname: "Traveler",
    posts: 12,
    watched: 34,
    followers: 150,
    follow: 25,
    avatar: "https://i.imgur.com/3GvwNBf.png",
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <h1>PROFILE</h1>
        <button className="edit-button" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </header>

      {/* Info */}
      <section className="profile-info">
        <div className="info-left">
          <div
            className="profile-avatar-placeholder"
            style={{ backgroundImage: `url(${userData.avatar})` }}
          ></div>
          <span className="profile-name">{userData.name}</span>
          <span className="profile-nickname">{userData.nickname}</span>
        </div>
        <div className="info-right">
          <div className="profile-stats">
            <div><strong>{userData.posts}</strong> posts</div>
            <div><strong>{userData.watched}</strong> watched</div>
            <div><strong>{userData.followers}</strong> followers</div>
            <div><strong>{userData.follow}</strong> follow</div>
          </div>
          <div className="profile-actions">
            <button>Follow</button>
            <button>Send message</button>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="posts-section">
        <h2 className="posts-title">POSTS</h2>
        <div className="view-mode-toggle">
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
        <div className={`posts-container ${viewMode}`}>
          {postsData.map((post) => (
            <div key={post.id} className="post-card">
              <img src={post.image} alt={post.title} className="post-image" />
              {viewMode === "list" && <h3 className="post-card-title">{post.title}</h3>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default OtherProfilePage;
