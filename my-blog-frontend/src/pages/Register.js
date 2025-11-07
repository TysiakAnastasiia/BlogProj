import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg";
import AvaImage from "../styles/ava.jpg";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    birth_date: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      alert("User created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <img src={WedImage} alt="Wedding" className="deco-image image-top-left" />
      <div className="form-wrapper">
        <h1 className="title">REGISTER</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="first_name">FIRST NAME</label>
            <input type="text" id="first_name" value={form.first_name} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="last_name">LAST NAME</label>
            <input type="text" id="last_name" value={form.last_name} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input type="text" id="username" value={form.username} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="birth_date">DATE OF BIRTH</label>
            <input type="date" id="birth_date" value={form.birth_date} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="email">EMAIL</label>
            <input type="email" id="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="phone">PHONE</label>
            <input type="text" id="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input type="password" id="password" value={form.password} onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">SUBMIT</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      <img src={AvaImage} alt="Avatar" className="deco-image image-bottom-right" />
    </div>
  );
}

export default Register;
