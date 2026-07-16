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

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    summary: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', NoteSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.error(err));

app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/notes', async (req, res) => {
    const { title, subject, content } = req.body;

    if (!title || !content || !subject) {
        return res.status(400).json({ error: 'Title, Subject, and Content are required!' });
    }

    try {
        const newNote = new Note({ title: title.trim(), subject: subject.trim(), content });
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    const { title, subject, content } = req.body;

    if (!title || !content || !subject) {
        return res.status(400).json({ error: 'Title, Subject, and Content are required!' });
    }

    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        note.title = title.trim();
        note.subject = subject.trim();
        note.content = content;
        note.summary = null;

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/notes/:id/summarize', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a study assistant. Given the user's notes, generate a structured JSON object. Do NOT include markdown code fences or any other text. Return ONLY valid JSON in this exact format: {\"summary\":[\"bullet 1\",\"bullet 2\",\"bullet 3\"],\"quiz\":[{\"question\":\"Q1 text\",\"options\":[\"A. option1\",\"B. option2\",\"C. option3\",\"D. option4\"],\"answer\":\"A\"},{\"question\":\"Q2 text\",\"options\":[\"A. option1\",\"B. option2\",\"C. option3\",\"D. option4\"],\"answer\":\"B\"},{\"question\":\"Q3 text\",\"options\":[\"A. option1\",\"B. option2\",\"C. option3\",\"D. option4\"],\"answer\":\"C\"}]}"
                },
                {
                    role: "user",
                    content: note.content
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const raw = chatCompletion.choices[0].message.content;
        let parsed;

        try {
            parsed = JSON.parse(raw);
        } catch {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return res.status(500).json({ error: 'AI returned invalid format' });
            }
        }

        if (!parsed.summary || !Array.isArray(parsed.summary) || !parsed.quiz || !Array.isArray(parsed.quiz)) {
            return res.status(500).json({ error: 'AI response missing required fields' });
        }

        note.summary = parsed;
        await note.save();

        res.json({ message: 'Summary & Quiz generated!', summary: parsed });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI Integration failed' });
    }
});

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