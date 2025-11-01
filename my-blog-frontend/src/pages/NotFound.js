import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound({ isLoggedIn }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      fontFamily: "'Montserrat', sans-serif",
      backgroundColor: "#fcf8ee",
      color: "#8d6e63",
      textAlign: "center",
      padding: "20px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "6rem",
      fontWeight: 700,
      margin: 0,
    },
    subtitle: {
      fontSize: "1.5rem",
      margin: "20px 0",
      opacity: 0.8,
    },
    button: {
      backgroundColor: "#ffffff",
      color: "#8d6e63",
      border: "none",
      borderRadius: "20px",
      padding: "12px 40px",
      fontWeight: 600,
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      transition: "background 0.3s",
    },
    buttonHover: {
      backgroundColor: "#f5f5f5",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.subtitle}>Oops! Page not found.</p>
      <button
        style={styles.button}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
        onClick={handleGoHome}
      >
        Go Home
      </button>
    </div>
  );
}

export default NotFound;
