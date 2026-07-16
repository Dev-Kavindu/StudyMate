import React, { useState } from 'react';

export default function NoteForm({ onNoteAdded }) {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !subject || !content) {
            setError('All fields are required!');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subject, content })
            });
            
            if (res.ok) {
                const newNote = await res.json();
                onNoteAdded(newNote);
                setTitle(''); setSubject(''); setContent(''); setError('');
            } else {
                setError('Failed to add note');
            }
        } catch (err) {
            setError('Failed to connect to backend server');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-card">
            <h3>✨ Create a New Note</h3>
            {error && <div className="error-msg">{error}</div>}
            
            <input type="text" className="input-field" placeholder="Note Title..." value={title} onChange={e => setTitle(e.target.value)} />
            <input type="text" className="input-field" placeholder="Subject / Module..." value={subject} onChange={e => setSubject(e.target.value)} />
            <textarea className="input-field" placeholder="Write your core concepts here..." value={content} onChange={e => setContent(e.target.value)}></textarea>
            
            <button type="submit" className="btn-submit">Save Note</button>
        </form>
    );
}