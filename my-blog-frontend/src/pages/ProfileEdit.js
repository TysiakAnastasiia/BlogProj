import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import { getProfile, updateProfile } from "../api/profileAPI";

function ProfileEdit() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const data = await getProfile(token);
        console.log("PROFILE RESPONSE:", data); // 🟢 Подивись у консолі, що повертає бекенд

        const user = data.user || data; // 🟢 fallback, якщо бекенд не загортає в user

        // Форматуємо дату
        const formattedDate = user.birth_date
          ? new Date(user.birth_date).toISOString().split("T")[0]
          : "";

        setProfileData({ ...user, birth_date: formattedDate });
        setProfilePic(user.avatar || null);
      } catch (err) {
        console.error("Помилка завантаження профілю:", err);
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
      const token = localStorage.getItem("token");
      await updateProfile(token, { ...profileData, avatar: profilePic });
      navigate("/profile");
    } catch (err) {
      console.error("Помилка оновлення профілю:", err);
    }
  };

  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>EDIT PROFILE</h1>
        <button className="edit-button" onClick={() => navigate("/profile")}>
          BACK
        </button>
      </header>

      <section className="profile-info">
        <div className="info-left">
          <div className="profile-avatar-placeholder">
            <img
              src={profilePic || "/default-avatar.png"}
              alt="Avatar"
              className="profile-picture"
            />
            <label className="edit-button">
              CHANGE PHOTO
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        <div className="info-right">
          <input
            type="text"
            name="first_name"
            value={profileData.first_name || ""}
            onChange={handleChange}
            className="detail-item"
            placeholder="First Name"
          />
          <input
            type="text"
            name="last_name"
            value={profileData.last_name || ""}
            onChange={handleChange}
            className="detail-item"
            placeholder="Last Name"
          />
          <input
            type="date"
            name="birth_date"
            value={profileData.birth_date || ""}
            onChange={handleChange}
            className="detail-item"
          />
          <input
            type="email"
            name="email"
            value={profileData.email || ""}
            onChange={handleChange}
            className="detail-item"
            placeholder="Email"
          />
          <input
            type="text"
            name="phone"
            value={profileData.phone || ""}
            onChange={handleChange}
            className="detail-item"
            placeholder="Phone"
          />
          <button className="add-post-button" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfileEdit;
