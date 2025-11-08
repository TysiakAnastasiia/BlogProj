import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import { getProfile, updateProfile } from "../api";

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


function ProfileEdit() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const showAlert = useCallback((message, type = 'success') => {
    setAlertType(type);
    setAlertMessage(message);
  }, []); 
  
  const closeAlert = () => setAlertMessage(null);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const data = await getProfile(token);
        console.log("📥 Profile loaded:", data);

        const formattedDate = data.birth_date
          ? new Date(data.birth_date).toISOString().split("T")[0]
          : "";
        
        setProfileData({ 
            ...data, 
            birth_date: formattedDate || "", 
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
        });
        setProfilePic(data.avatar_url || null);
      } catch (err) {
        console.error("❌ Помилка завантаження профілю:", err);
        showAlert("Не вдалося завантажити профіль", 'error'); 
      }
    };
    
    fetchProfile(); 
  }, [navigate, showAlert]); 

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
      
      showAlert("Профіль успішно оновлено!", 'success'); 
      
      setTimeout(() => navigate("/profile"), 1000); 
      
    } catch (err) {
      console.error("❌ Помилка оновлення профілю:", err);
      showAlert(`Помилка: ${err.response?.data?.message || err.message}`, 'error'); 
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-edit-page">
      <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} /> 
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
              value={profileData.first_name} 
              onChange={handleChange} 
              placeholder="Enter first name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={profileData.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={profileData.birth_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
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