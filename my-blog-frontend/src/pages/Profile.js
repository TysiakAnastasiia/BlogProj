import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import Header from "./Header";
// 'getProfile' - це, мабуть, ваш API-запит до '/api/users/me'
import { getProfile } from "../api"; 

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]); // Пости будуть тут
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const userData = await getProfile(token); // Отримуємо дані з /me

        setUser({
          ...userData,
          avatar: userData.avatar_url || "https://i.imgur.com/gBqR1gq.jpeg",
        });

        // --- ДОДАЙТЕ ЦЕЙ РЯДОК ---
        // Тепер наш бекенд повертає пости в об'єкті 'user'
        setPosts(userData.posts || []); 
        // -------------------------

      } catch (err) {
        console.error("Помилка при отриманні профілю:", err);
      }
    };
    fetchData();
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
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
              {/* Тепер 'posts.length' буде правильним */}
              <strong>{posts.length}</strong> posts
            </div>
            <div>
              <strong>{user.watched || 0}</strong> watched
            </div>
            <div>
              {/* Тепер 'user.followers' прийде з бекенду */}
              <strong>{user.followers || 0}</strong> followers
            </div>
            <div>
              {/* Тепер 'user.following' прийде з бекенду */}
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
          {/* Мапимо 'posts' зі стану, а не 'user.posts' */}
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <img
                // Використовуємо 'post.image_url' або 'post.image' (залежно від вашої БД)
                src={post.image || post.image_url || "https://i.imgur.com/3GvwNBf.png"} 
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