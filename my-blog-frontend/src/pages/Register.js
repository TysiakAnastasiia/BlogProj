import React from 'react';
import '../styles/styles.css';
import WedImage from "../styles/wed.jpg"; // якщо у pages, виходимо на src/styles
import AvaImage from "../styles/ava.jpg";


function Register() {
  return (
    <div className="container">
      {/* Декоративне зображення 1: Дракони */}
      <img 
        src={WedImage} 
        alt="Wedding" 
        className="deco-image image-top-left"
      />
      

      <div className="form-wrapper">
        <h1 className="title">REGISTER</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label htmlFor="firstName">FIRST NAME</label>
            <input type="text" id="firstName" />
          </div>

          <div className="input-group">
            <label htmlFor="lastName">LAST NAME</label>
            <input type="text" id="lastName" />
          </div>
          
          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input type="text" id="username" />
          </div>

          <div className="input-group">
            <label htmlFor="dob">DATE OF BIRTH</label>
            <input type="date" id="dob" />
          </div>

          <div className="input-group">
            <label htmlFor="contact">EMAIL or PHONE NUMBER</label>
            <input type="text" id="contact" />
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
        src={AvaImage} 
        alt="Avatar" 
        className="deco-image image-bottom-right"
      />
    </div>
  );
}

export default Register;