import React, { useState } from 'react';

export default function EditNoteModal({ note, onClose, onSave }) {
    const [title, setTitle] = useState(note.title || '');
    const [subject, setSubject] = useState(note.subject || '');
    const [content, setContent] = useState(note.content || '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !subject.trim() || !content.trim()) {
            setError('All fields are required!');
            return;
        }
        onSave(note._id, title.trim(), subject.trim(), content);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <h2>✏️ Edit Note</h2>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Note Title..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Subject / Module..."
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                    />
                    <textarea
                        className="input-field"
                        placeholder="Write your core concepts here..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        style={{ minHeight: '160px' }}
                    />
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}