import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [showLogin, setShowLogin] = useState(true); // true → показуємо Login

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div>
      {showLogin ? <Login /> : <Register />}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {showLogin ? (
          <>
            <span>Don't have an account? </span>
            <button onClick={toggleForm} style={{ cursor: "pointer" }}>
              Register
            </button>
          </>
        ) : (
          <>
            <span>Already have an account? </span>
            <button onClick={toggleForm} style={{ cursor: "pointer" }}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
