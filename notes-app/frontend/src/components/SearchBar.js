import React from 'react';
import './SearchBar.css';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Search notes by title or tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button 
          className="clear-search-btn"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
