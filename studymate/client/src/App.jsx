import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import EditNoteModal from './components/EditNoteModal';

const API = 'http://localhost:5000/api';

export default function App() {
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => localStorage.getItem('studymate-theme') || 'light');
    const [editingNote, setEditingNote] = useState(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('studymate-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${API}/notes`);
            const data = await res.json();
            setNotes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotes(); }, []);

    const handleNoteAdded = (newNote) => setNotes([newNote, ...notes]);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/notes/${id}`, { method: 'DELETE' });
            if (res.ok) setNotes(notes.filter(note => note._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (note) => setEditingNote(note);

    const handleUpdate = async (id, title, subject, content) => {
        try {
            const res = await fetch(`${API}/notes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subject, content })
            });
            if (res.ok) {
                const updated = await res.json();
                setNotes(notes.map(n => n._id === id ? updated : n));
                setEditingNote(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSummarizeUpdate = (id, summary) => {
        setNotes(notes.map(n => n._id === id ? { ...n, summary } : n));
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="app-container">
            <div className="header-controls">
                <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>

            <div className="header glass-card">
                <h1>StudyMate</h1>
                <p>Your AI-Powered Study Notes Workspace</p>
            </div>

            <input
                type="text"
                className="search-input"
                placeholder="🔍 Search notes by title or subject..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <NoteForm onNoteAdded={handleNoteAdded} />

            <div className="notes-list">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Your Notes</h3>

                {loading ? (
                    <>
                        <div className="loading-shimmer" />
                        <div className="loading-shimmer" />
                        <div className="loading-shimmer" />
                    </>
                ) : filteredNotes.length === 0 ? (
                    <div className="empty-state">
                        {search ? "No matching notes found" : "No notes yet. Add your first one above!"}
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onSummarizeUpdate={handleSummarizeUpdate}
                        />
                    ))
                )}
            </div>

            {editingNote && (
                <EditNoteModal
                    note={editingNote}
                    onClose={() => setEditingNote(null)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
}