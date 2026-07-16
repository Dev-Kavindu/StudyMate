import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';

export default function App() {
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchNotes = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notes');
            const data = await res.json();
            setNotes(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleNoteAdded = (newNote) => setNotes([newNote, ...notes]);
    
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${id}`, { method: 'DELETE' });
            if (res.ok) setNotes(notes.filter(note => note._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(search.toLowerCase()) || 
        note.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="app-container">
            <div className="header">
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
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your Notes</h3>
                
                {loading ? (
                    <div className="empty-state">Loading your workspace...</div>
                ) : filteredNotes.length === 0 ? (
                    <div className="empty-state">
                        {search ? "No matching notes found 😕" : "No notes yet. Add your first one above! 📝"}
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <NoteCard key={note._id} note={note} onDelete={handleDelete} />
                    ))
                )}
            </div>
        </div>
    );
}