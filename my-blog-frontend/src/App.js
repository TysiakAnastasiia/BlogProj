import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from './pages/Profile';
import ProfileEdit from "./pages/ProfileEdit"; // default import
import Dashboard from "./pages/Dashboard"; // default import
import NotFound from "./pages/NotFound";
import OtherProfilePage from "./pages/OtherProfile"; // додано

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/:userId" element={<OtherProfilePage />} /> {/* чужий профіль */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users/:id" element={<OtherProfilePage />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
