import React, { useState } from 'react';

export default function NoteCard({ note, onDelete }) {
    const [summaryData, setSummaryData] = useState(note.summary || '');
    const [loading, setLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const handleSummarize = async () => {
        setLoading(true);
        setSelectedAnswer(null);
        setShowResult(false);
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${note._id}/summarize`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setSummaryData(data.summary);
            }
        } catch (err) {
            console.error("AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // AI Text එකෙන් Bullet Points සහ Quiz එක වෙන් කරලා ගන්නා Function එක
    const parseAIResponse = (text) => {
        if (!text) return null;

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        let bullets = [];
        let question = '';
        let options = [];

        lines.forEach(line => {
            if (line.startsWith('*') || line.startsWith('-')) {
                bullets.push(line.replace(/^[\*\-\s]+/, ''));
            } else if (line.match(/^[A-D]\)/) || line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
                options.push(line);
            } else if (line.includes('?') || line.toLowerCase().includes('question')) {
                question = line.replace(/###\s*Quiz\s*Question|###\s*Question/gi, '').trim();
            }
        });

        // නිවැරදි පිළිතුර හොයාගන්න බැරි වුණොත් Default B (කලින් ආපු එක අනුව)
        return { bullets, question, options, correctAnswer: 'B' };
    };

    const parsed = parseAIResponse(summaryData);

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

            {/* AI section එක පට්ට ලස්සනට */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #f3f4f6' }}>
                {summaryData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 🌟 Part A: 3 Bullet-Point Summary Cards */}
                        <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✨ Quick Summary</span>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {parsed?.bullets.map((bullet, idx) => (
                                    <div key={idx} style={{ background: '#f9fafb', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #6366f1', fontSize: '0.95rem', color: '#374151' }}>
                                        {bullet}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 🧠 Part B: Interactive Quiz UI */}
                        {parsed?.question && (
                            <div style={{ background: '#f5f3ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🧠 Knowledge Check</span>
                                <p style={{ margin: '0.5rem 0 1rem 0', fontWeight: '600', color: '#1f2937', fontSize: '1rem' }}>{parsed.question}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {parsed.options.map((opt, idx) => {
                                        const optLetter = opt.charAt(0); // A, B, C, D
                                        const isSelected = selectedAnswer === optLetter;
                                        
                                        return (
                                            <button 
                                                key={idx}
                                                disabled={showResult}
                                                onClick={() => {
                                                    setSelectedAnswer(optLetter);
                                                    setShowResult(true);
                                                }}
                                                style={{
                                                    width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                                                    background: isSelected ? '#ede9fe' : '#ffffff', color: '#4b5563', cursor: showResult ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: 'all 0.2s'
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showResult && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '6px', background: selectedAnswer === parsed.correctAnswer ? '#d1fae5' : '#fee2e2', color: selectedAnswer === parsed.correctAnswer ? '#065f46' : '#991b1b', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                                        {selectedAnswer === parsed.correctAnswer ? '🎉 Correct Answer! Well done!' : `❌ Incorrect! The correct answer is Option ${parsed.correctAnswer}.`}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    <button 
                        onClick={handleSummarize} 
                        disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '0.65rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)', transition: 'all 0.2s' }}
                    >
                        {loading ? '⚡ Summarizing...' : '🤖 Generate AI Insights'}
                    </button>
                )}
            </div>
        </div>
    );
}