import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg";
import AvaImage from "../styles/ava.jpg";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    dob: "",
    contact: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Registration data:", form);

    // тут буде запит на бекенд, а поки — просто редірект
    navigate("/login");
  };

  return (
    <div className="container">
      <img 
        src={WedImage} 
        alt="Wedding" 
        className="deco-image image-top-left"
      />

      <div className="form-wrapper">
        <h1 className="title">REGISTER</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="firstName">FIRST NAME</label>
            <input type="text" id="firstName" value={form.firstName} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="lastName">LAST NAME</label>
            <input type="text" id="lastName" value={form.lastName} onChange={handleChange} />
          </div>
          
          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input type="text" id="username" value={form.username} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="dob">DATE OF BIRTH</label>
            <input type="date" id="dob" value={form.dob} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="contact">EMAIL or PHONE NUMBER</label>
            <input type="text" id="contact" value={form.contact} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input type="password" id="password" value={form.password} onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">SUBMIT</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
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

export default Register;
