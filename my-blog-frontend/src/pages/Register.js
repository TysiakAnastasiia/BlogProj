import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/api";
import "../styles/styles.css";
import WedImage from "../styles/wed.jpg";
import AvaImage from "../styles/ava.jpg";

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

function Register() {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const showAlert = (message, type = 'success') => {
    setAlertType(type);
    setAlertMessage(message);
  };
  
  const closeAlert = () => setAlertMessage(null);

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

  const validateForm = () => {
    const { first_name, last_name, username, email, password } = form;
    
    if (!first_name || !last_name || !username || !email || !password) {
        showAlert("All fields are required.", 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert("Please enter a valid email address.", 'error');
        return false;
    }
    
    if (username.length < 3) {
        showAlert("Username must be at least 3 characters long.", 'error');
        return false;
    }

    if (password.length < 6) {
        showAlert("Password must be at least 6 characters long.", 'error');
        return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    if (isSubmitting) return; // Запобігаємо подвійній відправці
    setIsSubmitting(true);

    try {
      const response = await register(form);
      console.log('Registration successful:', response);
      showAlert("User created successfully!", 'success');
      
      // Затримка перед редиректом, щоб користувач побачив повідомлення
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || "Registration failed. Please try again.";
      showAlert(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} /> 
      <img src={WedImage} alt="Wedding" className="deco-image image-top-left" />
      <div className="form-wrapper">
        <h1 className="title">REGISTER</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="first_name">FIRST NAME</label>
            <input 
              type="text" 
              id="first_name" 
              value={form.first_name} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="last_name">LAST NAME</label>
            <input 
              type="text" 
              id="last_name" 
              value={form.last_name} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input 
              type="text" 
              id="username" 
              value={form.username} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="birth_date">DATE OF BIRTH</label>
            <input 
              type="date" 
              id="birth_date" 
              value={form.birth_date} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">EMAIL</label>
            <input 
              type="email" 
              id="email" 
              value={form.email} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">PHONE</label>
            <input 
              type="text" 
              id="phone" 
              value={form.phone} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input 
              type="password" 
              id="password" 
              value={form.password} 
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
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