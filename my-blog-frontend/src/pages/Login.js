import React from 'react';
import '../styles/styles.css';

function Login() {
  return (
    <div className="container">
      {/* Декоративне зображення 1: Дракони */}
      <img 
        src="https://i.pinimg.com/originals/e7/3c/a1/e73ca1d279d493b8a12ff3570f43888c.jpg" 
        alt="Toothless and Light Fury" 
        className="deco-image image-top-left"
      />

      <div className="form-wrapper">
        <h1 className="title">LOGIN</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          
          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input type="text" id="username" />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input type="password" id="password" />
          </div>

          <button type="submit" className="submit-btn">SUBMIT</button>
        </form>
      </div>

      {/* Декоративне зображення 2: Олаф та Свен */}
       <img 
        src="https://lumiere-a.akamaihd.net/v1/images/p_frozen2_19630_b33917a8.jpeg" 
        alt="Olaf and Sven" 
        className="deco-image image-bottom-right"
      />
    </div>
  );
}

export default Login;