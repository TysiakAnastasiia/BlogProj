import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import defaultProfilePic from "../styles/ava.jpg";

function ProfileEdit() {
  const navigate = useNavigate();

  // Стейт для полів профілю
  const [profileData, setProfileData] = useState({
    firstName: "ANASTASIIA",
    lastName: "TYSIAK",
    birthday: "15.01.2006",
    email: "tysiaknastia@gmail.com",
    phone: "+380968219001",
  });

  // Стейт для аватару
  const [profilePic, setProfilePic] = useState(defaultProfilePic);

  // Обробник зміни полів
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Обробник зміни фото
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <h1>
          PROFILE SETTINGS <span className="header-subtitle">(only you see info)</span>
        </h1>
        <button className="edit-button" onClick={() => navigate("/profile")}>
          ← Back
        </button>
      </header>

      {/* Main Content */}
      <main className="profile-content">
        {/* Left Column */}
        <section className="profile-left-column">
          <div className="profile-info-block">
            <div className="profile-picture-wrapper">
              <img src={profilePic} alt="Profile" className="profile-picture" />
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

            <div className="profile-details">
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                className="detail-item"
              />
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                className="detail-item"
              />
              <input
                type="text"
                name="birthday"
                value={profileData.birthday}
                onChange={handleChange}
                className="detail-item"
              />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="detail-item"
              />
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="detail-item"
              />
            </div>
          </div>

          <div className="posts-section">
            <h2 className="section-title">POSTS</h2>
            <div className="content-box posts-box">
              <span>SEE ALL</span>
            </div>
          </div>
        </section>

        {/* Right Column */}
        <section className="profile-right-column">
          <div className="watched-section">
            <h2 className="section-title">WATCHED</h2>
            <div className="content-box watched-box">
              <span>LIST</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfileEdit;
