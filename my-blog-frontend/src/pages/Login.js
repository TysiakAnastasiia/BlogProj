import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg";
import AvaImage from "../styles/ava.jpg";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    contact: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login data:", form);

    // тимчасово редірект на профіль
    navigate("/profile");
  };

  return (
    <div className="container">
      <img 
        src={WedImage} 
        alt="Wedding" 
        className="deco-image image-top-left"
      />

      <div className="form-wrapper">
        <h1 className="title">LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="contact">EMAIL or PHONE NUMBER</label>
            <input
              type="text"
              id="contact"
              value={form.contact}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">LOGIN</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      <img 
        src={AvaImage} 
        alt="Avatar" 
        className="deco-image image-bottom-right"
      />
    </div>
  );
}

export default Login;
