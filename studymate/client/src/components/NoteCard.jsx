import React, { useState } from 'react';

export default function NoteCard({ note, onDelete, onEdit, onSummarizeUpdate }) {
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${note._id}/summarize`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                onSummarizeUpdate(note._id, data.summary);
            }
        } catch (err) {
            console.error("AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const summary = note.summary;
    const hasSummary = summary && summary.summary && Array.isArray(summary.summary);
    const hasQuiz = summary && summary.quiz && Array.isArray(summary.quiz) && summary.quiz.length > 0;

    return (
        <div className="note-card">
            <div className="note-header">
                <div className="note-header-left">
                    <h4 className="note-title">{note.title}</h4>
                    <span className="note-subject">{note.subject}</span>
                </div>
                <div className="note-actions">
                    <button onClick={() => onEdit(note)} className="btn-icon edit" title="Edit note">✏️</button>
                    <button onClick={() => onDelete(note._id)} className="btn-icon delete" title="Delete note">🗑️</button>
                </div>
            </div>
            <p className="note-content">{note.content}</p>

            <div className="ai-section">
                {hasSummary ? (
                    <AIInsights summary={summary} />
                ) : hasQuiz ? (
                    <AIInsights summary={summary} />
                ) : (
                    <button
                        onClick={handleSummarize}
                        disabled={loading}
                        className="btn-ai"
                    >
                        {loading ? '⚡ Generating...' : '🤖 Generate AI Insights'}
                    </button>
                )}
            </div>
        </div>
    );
}

function AIInsights({ summary }) {
    const bullets = summary.summary || [];
    const quiz = summary.quiz || [];
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState({});

    const handleSelect = (qIdx, option) => {
        if (submitted[qIdx]) return;
        setAnswers(prev => ({ ...prev, [qIdx]: option }));
        setSubmitted(prev => ({ ...prev, [qIdx]: true }));
    };

    const getOptionClass = (qIdx, optLabel, isCorrect) => {
        const selected = answers[qIdx];
        if (!submitted[qIdx]) return '';
        if (optLabel === selected) {
            return isCorrect ? 'correct' : 'incorrect';
        }
        if (isCorrect && submitted[qIdx]) return 'correct';
        return '';
    };

    const correctCount = quiz.filter((q, i) => {
        const correctLabel = q.answer ? q.answer.trim().toUpperCase() : '';
        const selectedLabel = answers[i] ? answers[i].trim().toUpperCase() : '';
        return submitted[i] && selectedLabel === correctLabel;
    }).length;

    const allSubmitted = quiz.length > 0 && quiz.every((_, i) => submitted[i]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="ai-section-header">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ✨ Quick Summary
                </span>
            </div>

            <div className="summary-cards">
                {bullets.map((bullet, idx) => (
                    <div key={idx} className="summary-card">
                        <span className="bullet-icon">
                            {['📌', '⭐', '💡'][idx] || '•'}
                        </span>
                        {bullet}
                    </div>
                ))}
            </div>

            {quiz.length > 0 && (
                <div className="quiz-section">
                    <div className="quiz-section-title">🧠 Knowledge Check</div>
                    {quiz.map((q, qIdx) => {
                        const isCorrect = answers[qIdx]
                            ? answers[qIdx].trim().toUpperCase() === (q.answer ? q.answer.trim().toUpperCase() : '')
                            : false;

                        return (
                            <div key={qIdx} className="quiz-card">
                                <p className="quiz-question">Q{qIdx + 1}. {q.question}</p>
                                <div className="quiz-options">
                                    {(q.options || []).map((opt, oIdx) => {
                                        const optLabel = opt.charAt(0).toUpperCase();
                                        const isOptCorrect = optLabel === (q.answer ? q.answer.trim().toUpperCase() : '');
                                        return (
                                            <button
                                                key={oIdx}
                                                className={`quiz-option ${getOptionClass(qIdx, optLabel, isOptCorrect)}`}
                                                disabled={!!submitted[qIdx]}
                                                onClick={() => handleSelect(qIdx, optLabel)}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                {submitted[qIdx] && (
                                    <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        {isCorrect ? '✅ Correct!' : `❌ Incorrect. The answer is ${q.answer}.`}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {allSubmitted && (
                        <div className="quiz-score">
                            🎯 Score: {correctCount} / {quiz.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}