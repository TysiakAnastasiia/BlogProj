import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg";
import AvaImage from "../styles/ava.jpg";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      
      // ✅ ВИПРАВЛЕНО: Зберігаємо і токен, і дані користувача
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // ← ДОДАНО!
      
      console.log("✅ Login successful:", res.data.user);
      
      alert(`Welcome, ${res.data.user.first_name}!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data);
      alert(err.response?.data.message || "Login failed");
    }
  };

  return (
    <div className="container">
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