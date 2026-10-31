// LocalStorage utilities for offline functionality

const STORAGE_KEY = 'notes-app-data';

export const saveToLocalStorage = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
};

// Theme persistence
const THEME_KEY = 'notes-app-theme';

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    return true;
  } catch (error) {
    console.error('Failed to save theme:', error);
    return false;
  }
};

export const loadTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch (error) {
    console.error('Failed to load theme:', error);
    return 'light';
  }
};
