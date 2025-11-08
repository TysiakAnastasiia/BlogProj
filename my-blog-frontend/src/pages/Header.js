import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { FaHome, FaUserCircle, FaSignOutAlt, FaSearch } from "react-icons/fa";
import axios from "axios";

function Header() {
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Фетч користувачів за нікнеймом
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userSearch.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: userSearch }, // на бекенді треба підтримати query param q
        });
        // Фільтруємо локально, якщо бекенд не підтримує search
        setSearchResults(
          res.data.filter((u) =>
            u.username.toLowerCase().includes(userSearch.toLowerCase())
          )
        );
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      }
    };

    fetchUsers();
  }, [userSearch]);

  // Закриття дропдауну при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="main-header">
      <div className="header-left">
        <a href="/dashboard" className="header-icon-button" aria-label="Dashboard">
          <FaHome />
        </a>
      </div>

      <div className="header-center" ref={dropdownRef}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchResults[0]) navigate(`/profile/${searchResults[0].id}`);
          }}
          className="user-search-form"
        >
          <input
            type="text"
            placeholder="Find friends..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="user-search-input"
          />
          <button type="submit" className="user-search-button" aria-label="Search">
            <FaSearch />
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="search-result-item"
                onClick={() => {
                  navigate(`/profile/${user.id}`);
                  setUserSearch("");
                  setSearchResults([]);
                }}
              >
                {user.username}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-right">
        <a href="/profile" className="header-icon-button" aria-label="My Profile">
          <FaUserCircle />
        </a>
        <button onClick={handleLogout} className="header-icon-button" aria-label="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
}

export default Header;
