import express from "express";
import { db } from "../db.js";
import { GoogleGenAI, Type } from "@google/genai";

const router = express.Router();

router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;
  try {
    const chats = db.prepare("SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

router.get("/messages/:chatId", (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = db.prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC").all(chatId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/save", async (req, res) => {
  const { userId, chatId, sender, text } = req.body;
  
  if (!userId || !text || !sender) {
    return res.status(400).json({ error: "User ID, sender, and text are required" });
  }

  try {
    let currentChatId = chatId;
    
    // Create new chat if none exists
    if (!currentChatId) {
      const title = text.substring(0, 30) + (text.length > 30 ? "..." : "");
      const result = db.prepare("INSERT INTO chats (user_id, title) VALUES (?, ?)").run(userId, title);
      currentChatId = result.lastInsertRowid;
    }

    // Save message
    db.prepare("INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)").run(currentChatId, sender, text);

    res.json({ chatId: currentChatId, success: true });
  } catch (err: any) {
    console.error("Save message error:", err);
    res.status(500).json({ error: err.message || "Failed to save message" });
  }
});

export default router;
