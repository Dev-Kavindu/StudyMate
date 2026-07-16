const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OpenAI = require('openai');

const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY
});

// 1. Mongoose Model Setup
const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', NoteSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.error(err));

// 2. API Routes
// GET all notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST a new note (with Validation)
app.post('/api/notes', async (req, res) => {
    const { title, subject, content } = req.body;
    
    // Validation
    if (!title || !content || !subject) {
        return res.status(400).json({ error: 'Title, Subject, and Content are required!' });
    }

    try {
        const newNote = new Note({ title, subject, content });
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/notes/:id/summarize
app.post('/api/notes/:id/summarize', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        // Groq AI එකට Note එක යවා Rubric එකට අනුව 3 Bullet points + 1 Quiz එකක් ඉල්ලීම
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are a study assistant. Provide exactly a 3 bullet-point summary followed by 1 multiple-choice quiz question based on the text provided. Format nicely." 
                },
                { 
                    role: "user", 
                    content: note.content 
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const summaryResult = chatCompletion.choices[0].message.content;

        // DB එකේ Note Document එකට summary එක save කිරීම (එතකොට refresh කරත් පවතිනවා)
        note.summary = summaryResult;
        await note.save();

        res.json({ message: 'Summary & Quiz generated!', summary: summaryResult });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI Integration failed' });
    }
});

// DELETE a note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });
        
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));