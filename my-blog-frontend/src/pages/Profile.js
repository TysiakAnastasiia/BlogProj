// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import Header from "./Header";         
import { getProfile } from "../api";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]); 
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const userData = await getProfile(token);

        setUser({
          ...userData,
          avatar: userData.avatar_url || "https://i.imgur.com/gBqR1gq.jpeg",
        });
      } catch (err) {
        console.error("Помилка при отриманні профілю:", err);
      }
    };
    fetchData();
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      {/* --- Додаємо хедер --- */}
      <Header />

      <header className="profile-header">
        <h1>PROFILE</h1>
        <div>
          <button
            className="edit-button"
            onClick={() => navigate("/profile/edit")}
          >
            EDIT
          </button>
        </div>
      </header>

      <section className="profile-info">
        <div className="info-left">
          <div
            className="profile-avatar-placeholder"
            style={{
              backgroundImage: `url(${user.avatar})`,
            }}
          ></div>
          <span className="profile-name">
            {user.first_name} {user.last_name}
          </span>
          <span className="profile-nickname">{user.username}</span>
        </div>
        <div className="info-right">
          <div className="profile-stats">
            <div>
              <strong>{posts.length}</strong> posts
            </div>
            <div>
              <strong>{user.watched || 0}</strong> watched
            </div>
            <div>
              <strong>{user.followers || 0}</strong> followers
            </div>
            <div>
              <strong>{user.following || 0}</strong> follow
            </div>
          </div>
        </div>
      </section>

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
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <img
                src={post.image}
                alt={post.title}
                className="post-image"
              />
              {viewMode === "list" && (
                <h3 className="post-card-title">{post.title}</h3>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
