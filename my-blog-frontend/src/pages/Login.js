import React, { useState } from "react";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg"; 
import AvaImage from "../styles/ava.jpg";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { username, password });
  };

  return (
    <div className="container">
      {}
      <img 
        src={WedImage} 
        alt="Wedding" 
        className="deco-image image-top-left"
      />

      <div className="form-wrapper">
        {}
        <h1 className="title gradient-text">LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            LOGIN
          </button>
        </form>
      </div>

      {}
      <img 
        src={AvaImage} 
        alt="Avatar" 
        className="deco-image image-bottom-right"
      />
    </div>
  );
}

export default Login;
