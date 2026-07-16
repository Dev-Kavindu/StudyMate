import React from 'react';

export default function NoteCard({ note, onDelete }) {
    return (
        <div className="note-card">
            <div className="note-header">
                <div>
                    <h4 className="note-title">{note.title}</h4>
                    <span className="note-subject">{note.subject}</span>
                </div>
                <button onClick={() => onDelete(note._id)} className="btn-delete">Delete</button>
            </div>
            <p className="note-content">{note.content}</p>
        </div>
    );
}