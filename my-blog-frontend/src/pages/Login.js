import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg";
import AvaImage from "../styles/ava.jpg";
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


function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  
  const showAlert = (message, type = 'success') => {
    setAlertType(type);
    setAlertMessage(message);
  };
  
  const closeAlert = () => setAlertMessage(null);

  const validateForm = () => {
    if (!form.usernameOrEmail || !form.password) {
        showAlert("Both username/email and password are required.", 'error');
        return false;
    }
    if (form.password.length < 6) {
        showAlert("Password must be at least 6 characters long.", 'error');
        return false;
    }
    return true;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post("/api/auth/login", form);      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); 
      
      console.log("Login successful:", res.data.user);
      
      showAlert(`Welcome, ${res.data.user.first_name}!`, 'success'); 
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      showAlert(err.response?.data.message || "Login failed", 'error'); 
    }
  };

  return (
    <div className="container">
      <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} /> 
      <img src={WedImage} alt="Wedding" className="deco-image image-top-left" />
      <div className="form-wrapper">
        <h1 className="title">LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="usernameOrEmail">EMAIL or USERNAME</label>
            <input 
              type="text" 
              id="usernameOrEmail" 
              value={form.usernameOrEmail} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input 
              type="password" 
              id="password" 
              value={form.password} 
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">LOGIN</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
      <img src={AvaImage} alt="Avatar" className="deco-image image-bottom-right" />
    </div>
  );
}

export default Login;