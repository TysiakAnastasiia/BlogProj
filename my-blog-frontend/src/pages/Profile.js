import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; // твій CSS

const postsData = [
  { id: 1, title: "MY STORY....", image: "https://i.imgur.com/WlWjXBm.png" },
  { id: 2, title: "WHY I LIKE THIS BOOK?...", image: "https://i.imgur.com/f9tH8rK.png" },
  { id: 3, title: "INTERESTING OPINION", image: "https://i.imgur.com/p8qI3cW.png" },
];

function ProfileHeader() {
  const navigate = useNavigate();
  return (
    <header className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h1>PROFILE</h1>
      <div style={{ display: "flex", gap: "15px" }}>
        <button className="edit-button" onClick={() => navigate("/profile/edit")}>EDIT</button>
        <img
          src="/logo192.png" // public/logo192.png
          alt="Home"
          style={{ width: 24, height: 24, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        />
      </div>
    </header>
  );
}

function ProfileInfo({ isOwner }) {
  return (
    <section className="profile-info">
      <div className="info-left">
        <div
          className="profile-avatar-placeholder"
          style={{ backgroundImage: "url('https://i.imgur.com/gBqR1gq.jpeg')" }}
        ></div>
        <span className="profile-name">ANASTASIIA TYSIAK</span>
        <span className="profile-nickname">Little sunny</span>
      </div>
      <div className="info-right">
        <div className="profile-stats">
          <div><strong>100</strong> posts</div>
          <div><strong>56</strong> watched</div>
          <div><strong>200</strong> followers</div>
          <div><strong>20</strong> follow</div>
        </div>
        {!isOwner && (
          <div className="profile-actions">
            <button>Follow or Like</button>
            <button>Send message</button>
          </div>
        )}
      </div>
    </section>
  );
}

function PostsSection() {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <section className="posts-section">
      <h2 className="posts-title">POSTS</h2>
      <div className="view-mode-toggle">
        <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
        <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
      </div>
      <div className={`posts-container ${viewMode}`}>
        {postsData.map((post) => (
          <div key={post.id} className="post-card">
            <img src={post.image} alt={post.title} className="post-image" />
            <h3 className="post-card-title">{post.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfilePage() {
  return (
    <div className="profile-page">
      <ProfileHeader />
      <ProfileInfo isOwner={true} />
      <PostsSection />
    </div>
  );
}

function ProfileEdit() {
  const navigate = useNavigate();
  return (
    <div className="profile-page">
      <header className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>EDIT PROFILE</h1>
        <button className="edit-button" onClick={() => navigate("/profile")}>BACK</button>
      </header>
      <section className="profile-info">
        <div className="info-left">
          <div
            className="profile-avatar-placeholder"
            style={{ backgroundImage: "url('https://i.imgur.com/gBqR1gq.jpeg')" }}
          ></div>
          <button className="edit-button">CHANGE PHOTO</button>
        </div>
        <div className="info-right">
          <input type="text" className="detail-item" defaultValue="ANASTASIIA" />
          <input type="text" className="detail-item" defaultValue="TYSIAK" />
          <input type="text" className="detail-item" defaultValue="15.01.2006" />
          <input type="text" className="detail-item" defaultValue="tysiaknastia@gmail.com" />
          <input type="text" className="detail-item" defaultValue="+380968219001" />
        </div>
      </section>
    </div>
  );
}

export { ProfilePage, ProfileEdit };
