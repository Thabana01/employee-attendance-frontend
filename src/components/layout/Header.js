import React from 'react';
import './Header.css';

const Header = ({ currentPage, onPageChange }) => {
  const currentTime = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="professional-header">
      <div className="header-content">

        {/* Brand and Date Section */}
        <div className="header-brand">
          <div className="logo">
            <h1>Employee Attendance</h1>
            <p className="tagline">Employee Management System</p>
          </div>
          <div className="current-time">
            {currentTime}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="header-nav">
          <button
            className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onPageChange('dashboard')}
          >
            Dashboard
          </button>

          <button
            className={`nav-button ${currentPage === 'form' ? 'active' : ''}`}
            onClick={() => onPageChange('form')}
          >
            Mark Attendance
          </button>
        </nav>

      </div>
    </header>
  );
};

export default Header;
