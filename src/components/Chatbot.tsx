import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";

export default function Chatbot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchHistory();
    fetchColleges();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchColleges = async () => {
    try {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      setColleges(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/chat/history/${user.id}`);
      const chats = await res.json();
      if (chats.length > 0) {
        setChatId(chats[0].id);
        const msgRes = await fetch(`/api/chat/messages/${chats[0].id}`);
        const msgs = await msgRes.json();
        setMessages(msgs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveMessageToDb = async (sender: string, text: string, currentChatId: number | null) => {
    try {
      const res = await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          chatId: currentChatId,
          sender,
          text,
        }),
      });
      const data = await res.json();
      if (res.ok && data.chatId) {
        setChatId(data.chatId);
        return data.chatId;
      }
    } catch (err) {
      console.error("Failed to save message", err);
    }
    return currentChatId;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg = { sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let currentChatId = chatId;
    currentChatId = await saveMessageToDb("user", userText, currentChatId);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const collegeContext = JSON.stringify(colleges);
      const systemInstruction = `You are an AI College Guide Chatbot. 
      You help students find colleges, courses, fees, placements, and scholarships.
      Here is the current database of colleges: ${collegeContext}
      Answer the user's question based on this data. If they ask for something not in the data, try to be helpful but mention you only have limited data.
      If a college has a website listed in the data, ALWAYS provide the official website link in your response.
      Format your response nicely using Markdown (e.g., bolding college names, using bullet points).
      Be friendly, concise, and informative.`;

      const historyText = messages.slice(-10).map(m => `${m.sender}: ${m.text}`).join("\n");
      const prompt = `Chat History:\n${historyText}\n\nUser: ${userText}\nAI:`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
        }
      });

      const aiMessage = response.text || "I'm sorry, I couldn't process that request.";
      setMessages((prev) => [...prev, { sender: "ai", text: aiMessage }]);
      await saveMessageToDb("ai", aiMessage, currentChatId);

    } catch (err: any) {
      let errorMessage = "Failed to connect to the AI. Please try again.";
      if (err.message === "API_KEY_MISSING" || err.message?.includes("API key not valid")) {
        errorMessage = "It looks like your Gemini API Key is missing or invalid. To fix this:\n1. Open the **Settings** menu in AI Studio.\n2. Go to the **Secrets** panel.\n3. Add a secret named `GEMINI_API_KEY` with your actual API key.\n\nOnce added, try asking your question again!";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setMessages((prev) => [...prev, { sender: "ai", text: `⚠️ **Error:**\n\n${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">AI College Assistant</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ask me about colleges, courses, fees, and placements.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Bot size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to AI College Guide!</h3>
            <p className="mt-3 max-w-md text-slate-500 dark:text-slate-400">
              I can help you find the perfect college. Try asking:
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => setInput("Which college is best for CSE in Konaseema?")} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20">
                "Which college is best for CSE in Konaseema?"
              </button>
              <button onClick={() => setInput("Tell me about BVCITS")} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20">
                "Tell me about BVCITS"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
              msg.sender === "user" ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" : "bg-white text-indigo-600 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
            }`}>
              {msg.sender === "user" ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
              msg.sender === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-white text-slate-800 rounded-tl-none border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            }`}>
              {msg.sender === "user" ? (
                <p className="leading-relaxed">{msg.text}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-indigo-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400">
              <Bot size={20} />
            </div>
            <div className="flex items-center rounded-2xl rounded-tl-none border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Loader2 size={20} className="animate-spin text-indigo-500" />
              <span className="ml-3 text-sm font-medium text-slate-500 dark:text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSend} className="relative mx-auto flex max-w-4xl items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about colleges..."
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-4 pl-6 pr-14 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 dark:disabled:opacity-30"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
