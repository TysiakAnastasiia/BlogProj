import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import Header from "./Header";
import { getProfile } from "../api";
import defaultImage from "../styles/def.png";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [movies, setMovies] = useState([]);
  const [contentType, setContentType] = useState("posts"); // "posts" або "movies"
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

        // Встановлюємо пости і фільми з відповіді
        setPosts(userData.posts || []);
        setMovies(userData.movies || []);

      } catch (err) {
        console.error("Помилка при отриманні профілю:", err);
      }
    };
    fetchData();
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  // Вибираємо які дані показувати (пости або фільми)
  const displayItems = contentType === "posts" ? posts : movies;

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
        <h2 className="posts-title">MY CONTENT</h2>

        {/* Перемикач між постами і фільмами */}
        <div className="content-type-toggle">
          <button
            className={contentType === "posts" ? "active" : ""}
            onClick={() => setContentType("posts")}
          >
            Posts ({posts.length})
          </button>
          <button
            className={contentType === "movies" ? "active" : ""}
            onClick={() => setContentType("movies")}
          >
            Movies ({movies.length})
          </button>
        </div>

        {/* Перемикач виду */}
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

        {/* Відображення постів або фільмів */}
        <div className={`posts-container ${viewMode}`}>
          {displayItems.length === 0 ? (
            <p>No {contentType} yet</p>
          ) : (
            displayItems.map((item) => (
              <div key={item.id} className="post-card">
                <img
                  src={item.image || item.image_url || defaultImage}
                  alt={item.title}
                  className="post-image"
                />
                <div className="post-caption">
                  <strong>{item.title}</strong>
                  {viewMode === "list" && item.genre && (
                    <span> ({item.year}) - {item.genre}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;