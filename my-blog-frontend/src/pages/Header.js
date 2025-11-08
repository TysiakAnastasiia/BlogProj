import React, { useState } from 'react';
import '../styles/Header.css'; 

// 1. Імпортуємо потрібні іконки
// FaHome = Головна, FaUserCircle = Профіль, FaSignOutAlt = Вийти, FaSearch = Пошук
import { FaHome, FaUserCircle, FaSignOutAlt, FaSearch } from 'react-icons/fa';

function Header() {
  const [userSearch, setUserSearch] = useState('');

  // Функція для виходу з акаунту
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  // Функція для пошуку користувача
  const handleUserSearch = (e) => {
    e.preventDefault();
    if (!userSearch.trim()) return; // Не шукати, якщо пусто
    
    alert(`Пошук користувача: "${userSearch}" (ще не реалізовано)`);
  };

  return (
    <nav className="main-header">
      <div className="header-left">
        {/* 2. Посилання на Dashboard (головну) з іконкою */}
        <a href="/dashboard" className="header-icon-button" aria-label="Dashboard">
          <FaHome />
        </a>
      </div>
      
      <div className="header-center">
        {/* 3. Оновлена форма пошуку */}
        <form onSubmit={handleUserSearch} className="user-search-form">
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
      </div>
      
      <div className="header-right">
        {/* 4. Посилання на профіль з іконкою*/}
        <a href="/profile" className="header-icon-button" aria-label="My Profile">
          <FaUserCircle />
        </a>
        {/* 5. Кнопка виходу з іконкою */}
        <button onClick={handleLogout} className="header-icon-button" aria-label="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
}

export default Header;