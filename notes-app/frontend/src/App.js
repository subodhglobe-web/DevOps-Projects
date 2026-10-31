import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SearchBar from './components/SearchBar.js';
import ThemeToggle from './components/ThemeToggle.js';
import { saveToLocalStorage, loadFromLocalStorage, saveTheme, loadTheme } from './utils/localStorage.js';
import './App.css'

function App() {
  const [notes, setNotes] = useState([]);
  const [markdown, setMarkdown] = useState('# Welcome to Notes App\nType your Markdown here...');
  const [tag, setTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isOnline, setIsOnline] = useState(true);

  // Initialize theme and load notes
  useEffect(() => {
    const savedTheme = loadTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    loadNotes();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      saveToLocalStorage(notes);
    }
  }, [notes]);

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
      saveToLocalStorage(data); // Backup to localStorage
    } catch (error) {
      console.error('Error loading notes from server:', error);
      // Fallback to localStorage if server is unavailable
      const localNotes = loadFromLocalStorage();
      if (localNotes.length > 0) {
        setNotes(localNotes);
        console.log('Loaded notes from localStorage backup');
      }
    }
  };

  const saveNote = async () => {
    if (!markdown.trim()) {
      alert('Please write something before saving!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown, tag }),
      });
      
      if (!response.ok) throw new Error('Failed to save note');
      
      const result = await response.json();
      alert('✓ Note saved successfully!');
      loadNotes();
      setSelectedNoteId(result.id);
    } catch (error) {
      console.error('Error saving note:', error);
      // Save to localStorage if server is unavailable
      const newNote = {
        id: Date.now(),
        markdown,
        tag,
        timestamp: new Date().toISOString()
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveToLocalStorage(updatedNotes);
      alert('⚠ Saved offline. Will sync when connection restored.');
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await fetch(`http://localhost:5000/notes/${id}`, {
        method: 'DELETE',
      });
      loadNotes();
      if (selectedNoteId === id) {
        resetEditor();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Delete from local state if server is unavailable
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      saveToLocalStorage(updatedNotes);
      if (selectedNoteId === id) {
        resetEditor();
      }
    }
  };

  const selectNote = (note) => {
    setMarkdown(note.markdown);
    setTag(note.tag);
    setSelectedNoteId(note.id);
  };

  const resetEditor = () => {
    setMarkdown('# New Note\nType here...');
    setTag('');
    setSelectedNoteId(null);
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const filteredNotes = notes.filter(note =>
    note.markdown.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app" data-theme={theme}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📝 Notes ({notes.length})</h2>
          {!isOnline && <span className="offline-badge">⚠ Offline</span>}
        </div>
        
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div className="action-buttons">
          <button onClick={resetEditor} className="btn btn-new">+ New Note</button>
          <button onClick={exportNotes} className="btn btn-export">📥 Export</button>
        </div>

        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <p className="no-notes">No notes found. {searchTerm ? 'Try a different search.' : 'Create your first note!'}</p>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={`note-item ${selectedNoteId === note.id ? 'selected' : ''}`}
                onClick={() => selectNote(note)}
              >
                <h4>{note.markdown.split('\n')[0].replace('#', '').trim() || 'Untitled'}</h4>
                {note.tag && <span className="note-tag">🏷️ {note.tag}</span>}
                <small className="note-timestamp">{new Date(note.timestamp).toLocaleString()}</small>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} 
                  className="btn-delete"
                  aria-label="Delete note"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="editor-section">
          <h3>✏️ Editor</h3>
          <textarea
            className="markdown-editor"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your Markdown here..."
          />
          <input
            type="text"
            placeholder="Add a tag (optional)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="tag-input"
          />
          <button onClick={saveNote} className="btn btn-save">💾 Save Note</button>
        </div>

        <div className="preview-section">
          <h3>👁️ Preview</h3>
          <div className="markdown-preview">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
