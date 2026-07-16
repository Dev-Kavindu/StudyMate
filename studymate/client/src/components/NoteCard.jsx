import React, { useState } from 'react';

export default function NoteCard({ note, onDelete }) {
    const [summary, setSummary] = useState(note.summary || '');
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        setLoading(true); // Loading state: true කරනවා
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${note._id}/summarize`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setSummary(data.summary); // AI summary එක state එකට දානවා
            }
        } catch (err) {
            console.error("AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

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

            {/* Part 4: AI Section */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #e5e7eb' }}>
                {summary ? (
                    <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                        <strong style={{ color: '#7c3aed', display: 'block', marginBottom: '0.5rem' }}>✨ AI Summary & Quiz:</strong>
                        <p style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'pre-wrap', color: '#4b5563' }}>{summary}</p>
                    </div>
                ) : (
                    <button 
                        onClick={handleSummarize} 
                        disabled={loading}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {loading ? '⚡ Summarizing...' : '🤖 Summarize with AI'}
                    </button>
                )}
            </div>
        </div>
    );
}