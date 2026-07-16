import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES Modules වලට env ෆයිල් එක ලෝඩ් කරගැනීම
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../server/.env") }); // Server එකේ තියෙන .env එකම පාවිච්චි කරයි

// MongoDB Schema & Model
const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);

// MCP Server එක Initialize කිරීම
const server = new Server(
    { name: "studymate-mcp-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// 1. AI එකට Tools ලැයිස්තුව ලබාදීම (List Tools)
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_notes",
                description: "Retrieve all study notes saved in the database.",
                inputSchema: { type: "object", properties: {} }
            },
            {
                name: "create_note",
                description: "Create and add a new study note to the database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The title of the note" },
                        subject: { type: "string", description: "The subject or course module" },
                        content: { type: "string", description: "The main content details of the note" }
                    },
                    required: ["title", "subject", "content"]
                }
            }
        ]
    };
});

// 2. AI එකෙන් එන Tool Calls හැන්ඩ්ල් කිරීම (Call Tool)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (mongoose.connection.readyState !== 1) {
        if (!process.env.MONGO_URI) {
            return { content: [{ type: "text", text: "Error: MONGO_URI is missing in .env file" }], isError: true };
        }
        await mongoose.connect(process.env.MONGO_URI);
    }

    try {
        if (name === "list_notes") {
            const notes = await Note.find().sort({ createdAt: -1 });
            const textResult = notes.map(n => `📌 [${n.subject}] ${n.title}\nContent: ${n.content}\n---`).join("\n\n");
            return {
                content: [{ type: "text", text: textResult || "No study notes found in the database." }]
            };
        } 
        
        else if (name === "create_note") {
            const { title, subject, content } = args;
            const newNote = new Note({ title, subject, content });
            await newNote.save();
            return {
                content: [{ type: "text", text: `✅ Note successfully created! Title: "${title}" under subject "${subject}".` }]
            };
        }

        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    } catch (error) {
        return { content: [{ type: "text", text: `Database Error: ${error.message}` }], isError: true };
    }
});

// Stdio හරහා සර්වර් එක Run කිරීම
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("StudyMate Standalone MCP Server running on stdio");
}

main().catch((err) => {
    console.error("Fatal MCP Error:", err);
    process.exit(1);
});