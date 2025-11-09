import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import Header from "./Header";
import axios from "axios";
import defaultImage from "../styles/def.png"; 

// --- ВИПРАВЛЕННЯ: Базовий URL повинен бути відносним для деплою ---
// Використовуйте /api, щоб звертатися до Express на Render
const BASE_URL = '/api/users'; 
// ------------------------------------------------------------------

const CustomAlert = ({ message, type, onClose }) => {
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 400); 
      }, 3000); 
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


function OtherProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [posts, setPosts] = useState([]);
  const [movies, setMovies] = useState([]); 
  const [contentType, setContentType] = useState("posts"); 
  
  const [viewMode, setViewMode] = useState("grid");
  const [following, setFollowing] = useState(false);
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message, type = 'success') => {
    setAlertType(type);
    setAlertMessage(message);
  };
  
  const closeAlert = () => setAlertMessage(null);


  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        // 1. ВИПРАВЛЕННЯ: Отримуємо ID поточного користувача через /users/me
        // Це потрібно, щоб перенаправити, якщо користувач дивиться свій профіль.
        const meRes = await axios.get(`/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.data.id.toString() === userId) {
          return navigate("/profile"); // Перенаправлення на свій профіль
        }

        // 2. ВИПРАВЛЕННЯ: Запит профілю іншого користувача
        const res = await axios.get(`${BASE_URL}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          ...res.data,
          avatar: res.data.avatar_url || "https://i.imgur.com/3GvwNBf.png",
        });
        
        setPosts(res.data.posts || []);
        setMovies(res.data.movies || []);
        
        setFollowing(res.data.isFollowing || false);

      } catch (err) {
        console.error("Помилка при завантаженні користувача:", err);
        showAlert("User not found or Server Error (check Render logs)", 'error'); 
        // navigate("/dashboard"); // Не перенаправляємо одразу, щоб бачити помилку
      }
    };

    fetchUser();
  }, [userId, navigate, showAlert]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      if (following) {
        await axios.post(
          `${BASE_URL}/${userId}/unfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showAlert(`Unfollowed ${user.username}`, 'success'); 
      } else {
        await axios.post(
          `${BASE_URL}/${userId}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showAlert(`Following ${user.username}`, 'success'); 
      }

      setFollowing(!following);
      setUser(prev => ({
        ...prev,
        followers: prev.followers + (following ? -1 : 1),
      }));
    } catch (err) {
      console.error("Помилка при підписці/відписці:", err);
      showAlert("Failed to update follow status", 'error'); 
    }
  };

  const displayItems = contentType === "posts" ? posts : movies;

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} /> 
      <Header />

      <header className="profile-header">
        <h1>{user.username}'S PROFILE</h1>
        <button className="edit-button" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </header>

      <section className="profile-info">
        <div className="info-left">
          <div
            className="profile-avatar-placeholder"
            style={{ backgroundImage: `url(${user.avatar})` }}
          ></div>
          <span className="profile-name">{user.first_name} {user.last_name}</span>
          <span className="profile-nickname">{user.username}</span>
        </div>
        <div className="info-right">
          <div className="profile-stats">
            <div><strong>{posts.length}</strong> posts</div>
            <div><strong>{movies.length || 0}</strong> movies</div>
            <div><strong>{user.followers || 0}</strong> followers</div>
            <div><strong>{user.following || 0}</strong> follow</div>
          </div>
          <div className="profile-actions">
            <button className="small-button" onClick={handleFollowToggle}>
              {following ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>
      </section>

      <section className="posts-section">
        <h2 className="posts-title">CONTENT</h2>
        
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

        <div className="view-mode-toggle">
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
          <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
        </div>
        
        <div className={`posts-container ${viewMode}`}>
          {displayItems.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', width: '100%' }}>
              No {contentType} found for this user.
            </p>
          ) : (
            displayItems.map(item => (
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

export default OtherProfilePage;