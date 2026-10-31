import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button 
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label="Toggle dark mode"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
