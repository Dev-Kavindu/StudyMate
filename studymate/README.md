# StudyMate 🧠📝

**An AI-Powered Study Notes Workspace** — built with the MERN stack, Groq AI, and MCP SDK. Create, edit, search, and delete study notes with intelligent summarization and interactive quizzes.

---

## ✨ Features

| Feature | Description |
|---|---|
| **📝 Create Notes** | Add notes with title, subject, and rich content. |
| **✏️ Edit Notes** | Update any note via a premium modal editor. |
| **🗑️ Delete Notes** | Remove notes with one click. |
| **🔍 Live Search** | Filter notes by title or subject instantly. |
| **🤖 AI Summarization** | Generate a 3-bullet-point summary using Groq's Llama 3.3 70B. |
| **🧠 Interactive Quiz** | 3 MCQ questions with instant correct/incorrect visual feedback and scoring. |
| **🌙 Dark Mode** | Toggle light/dark themes; preference persisted in `localStorage`. |
| **🎨 Glassmorphism UI** | Modern, premium design with blurred glass cards and smooth animations. |
| **☁️ Vercel Ready** | Pre-configured `vercel.json` for seamless frontend & backend deployment. |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Modern CSS (Glassmorphism) |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI Engine** | Groq SDK (Llama 3.3 70B Versatile) |
| **Protocol** | Model Context Protocol (MCP) SDK |
| **Deployment** | Vercel (Frontend + Serverless Functions) |

---

## 📸 Screenshots

### 1. Main Workspace
![Main Dashboard](.studymate/Screenshots/ui01.png)
![Main Dashboard](.studymate/Screenshots/ui02.png)

### 2. AI Insights & Interactive Quiz
![AI Insights and Quiz](.studymate/Screenshots/ai.png)

### 3. Dark Mode UI
![MCP Inspector View](.studymate/Screenshots/mcp.png)

---

## 🔧 Local Setup

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB instance)
- Groq API key (free tier available at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/studymate.git
cd studymate
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm start
```

The API will be available at `http://localhost:5000/api`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. MCP Server (Optional)

```bash
cd mcp-server
npm install
node index.js
```

---

## 🌐 Deployment (Vercel)

### Frontend

1. Push the repository to GitHub.
2. Import the `client/` directory as a new Vercel project.
3. Vercel will auto-detect the Vite framework and the `vercel.json` rewrites.

### Backend (Serverless)

1. Import the `server/` directory as a new Vercel project.
2. Set the following environment variables in Vercel dashboard:
   - `MONGO_URI`
   - `GROQ_API_KEY`
3. The `vercel.json` in `server/` handles the Express route mapping.

---

## 📁 Project Structure

```
studymate/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteForm.jsx      # Add note form
│   │   │   ├── NoteCard.jsx      # Note display + AI insights
│   │   │   └── EditNoteModal.jsx # Edit note modal
│   │   ├── App.jsx           # Main app with theme & state
│   │   ├── App.css           # Minimal app-level styles
│   │   ├── index.css         # Global styles + dark mode
│   │   └── main.jsx          # Entry point
│   ├── vercel.json           # SPA rewrites for Vercel
│   └── package.json
├── server/                   # Express backend
│   ├── server.js             # API routes + MongoDB + Groq
│   ├── vercel.json           # Serverless config for Vercel
│   └── package.json
├── mcp-server/               # Model Context Protocol server
│   ├── index.js
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | Fetch all notes (sorted by newest) |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/:id` | Update an existing note |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `POST` | `/api/notes/:id/summarize` | Generate AI summary & quiz |

---

## 🧪 Future Enhancements

- [ ] User authentication (JWT)
- [ ] Rich text editor (TipTap / Quill)
- [ ] Export notes as PDF
- [ ] Collaborative real-time editing
- [ ] Spaced-repetition flashcard mode

---

## 📄 License

MIT