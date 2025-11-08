import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import Header from "./Header";
import axios from "axios";

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
  const [viewMode, setViewMode] = useState("grid");
  const [following, setFollowing] = useState(false);
  
  // НОВІ СТАНИ
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

        const meRes = await axios.get(`http://localhost:5000/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.data.id.toString() === userId) {
          return navigate("/profile");
        }

        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          ...res.data,
          avatar: res.data.avatar_url || "https://i.imgur.com/3GvwNBf.png",
        });
        setPosts(res.data.posts || []);
        setFollowing(res.data.isFollowing || false);
      } catch (err) {
        console.error("Помилка при завантаженні користувача:", err);
        showAlert("User not found", 'error'); 
        navigate("/dashboard");
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
          `http://localhost:5000/api/users/${userId}/unfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showAlert(`Unfollowed ${user.username}`, 'success'); 
      } else {
        await axios.post(
          `http://localhost:5000/api/users/${userId}/follow`,
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


  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} /> 
      <Header />

      <header className="profile-header">
        <h1>PROFILE</h1>
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
            <div><strong>{user.watched || 0}</strong> watched</div>
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
        <h2 className="posts-title">POSTS</h2>
        <div className="view-mode-toggle">
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
          <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
        </div>
        <div className={`posts-container ${viewMode}`}>
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <img src={post.image || post.image_url} alt={post.title} className="post-image" />
              {viewMode === "list" && <h3 className="post-card-title">{post.title}</h3>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default OtherProfilePage;