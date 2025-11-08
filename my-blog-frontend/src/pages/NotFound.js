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
      height: "100vh",
      backgroundColor: "var(--bg-color)",
      color: "var(--text-color)",
      fontFamily: "'Montserrat', sans-serif",
      textAlign: "center",
      backgroundImage:
        "radial-gradient(at 20% 70%, rgba(102,126,234,0.15) 0, transparent 50%), radial-gradient(at 80% 30%, rgba(118,75,162,0.15) 0, transparent 50%)",
      backgroundAttachment: "fixed",
      backgroundSize: "80% 80%, 60% 60%",
      padding: "20px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "8rem",
      fontWeight: 800,
      margin: 0,
      background: "var(--accent-gradient)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "0 0 25px rgba(102,126,234,0.4)",
    },
    subtitle: {
      fontSize: "1.5rem",
      color: "var(--text-light)",
      marginTop: "10px",
      marginBottom: "30px",
      opacity: 0.9,
    },
    button: {
      background: "var(--accent-gradient)",
      color: "var(--accent-text)",
      border: "none",
      borderRadius: "25px",
      padding: "12px 40px",
      fontWeight: 600,
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "0 6px 15px var(--shadow-color)",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.subtitle}>Oops! Page not found.</p>
      <button
        style={styles.button}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--accent-hover-gradient)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--accent-gradient)")
        }
        onClick={handleGoHome}
      >
        Go Home
      </button>
    </div>
  );
}

export default NotFound;
