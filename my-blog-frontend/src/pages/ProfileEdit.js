import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import { getProfile, updateProfile } from "../api";

function ProfileEdit() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const data = await getProfile(token);
        console.log("📥 Profile loaded:", data);

        // Форматуємо дату
        const formattedDate = data.birth_date
          ? new Date(data.birth_date).toISOString().split("T")[0]
          : "";

        setProfileData({ ...data, birth_date: formattedDate });
        setProfilePic(data.avatar_url || null);
      } catch (err) {
        console.error("❌ Помилка завантаження профілю:", err);
        alert("Не вдалося завантажити профіль");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const updateData = {
        ...profileData,
        avatar: profilePic
      };
      
      console.log("📤 Sending update:", updateData);
      
      const response = await updateProfile(token, updateData);
      
      console.log("✅ Profile updated:", response);
      
      alert("Профіль успішно оновлено!");
      navigate("/profile");
    } catch (err) {
      console.error("❌ Помилка оновлення профілю:", err);
      alert(`Помилка: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-edit-page">
      <header className="profile-header">
        <h1>EDIT PROFILE</h1>
        <button className="back-button" onClick={() => navigate("/profile")}>
          ← BACK
        </button>
      </header>

      <section className="profile-edit-content">
        <div className="edit-left">
          <div className="avatar-container">
            <img
              src={profilePic || "https://i.imgur.com/gBqR1gq.jpeg"}
              alt="Avatar"
              className="profile-picture"
            />
            <label className="change-photo-button">
              📷 CHANGE PHOTO
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        <div className="edit-right">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={profileData.first_name || ""}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={profileData.last_name || ""}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={profileData.username || ""}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={profileData.birth_date || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email || ""}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone || ""}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <button 
            className="save-button" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfileEdit;