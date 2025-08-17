import React, { useState } from "react";
import axios from "axios";
import { Send, Upload, Recycle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi 👋! I’m CleanSight Assistant 🌱. Ask me anything about recycling, reuse, disposal, or related questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const formatGeminiOutput = (text) => {
    if (!text.startsWith("#")) text = "## Response\n\n" + text;
    return text;
  };

  const handleSend = async () => {
    if (!input && !image) return;

    const newMessage = {
      role: "user",
      content: input || "📷 Image uploaded",
      image: image ? URL.createObjectURL(image) : null,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Use last 8 messages for context
      const recentMessages = [...messages, newMessage].slice(-8);

      const contents = recentMessages.map((msg) => ({
        role: msg.role === "bot" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      let newParts = [];
      if (image) {
        const base64 = await fileToBase64(image);
        newParts.push({ inline_data: { mime_type: image.type, data: base64 } });
      }

      // Add system prompt for friendly, open-ended conversation
      contents.push({
        role: "user",
        parts: [
          {
            text: `
You are a friendly AI assistant called CleanSight 🌱. 
- Help users with recycling, reuse, disposal, cleanliness, and follow-up questions.
- Provide practical tips, DIY hacks, and advice.
- Only warn if the item is genuinely hazardous (chemicals, gas cylinders).
- Start with a **bold heading** summarizing main advice.
- Use bullet points or numbered steps.
- Include emojis (♻️, ✅, ⚠️, 🧽, 🏭) for clarity.
- Answer follow-up questions naturally, referring to previous messages if needed.
- If an image is uploaded, describe it briefly and give tailored advice.
- Keep responses friendly, engaging, concise, and formatted in Markdown.
            `.trim(),
          },
          ...newParts,
        ],
      });

      const res = await axios.post("/api/gemini", { contents });
      const rawReply = res.data.reply || "⚠️ No response from CleanSight AI.";
      const botReply = formatGeminiOutput(rawReply);

      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error getting response from CleanSight AI." },
      ]);
    }

    setLoading(false);
    setImage(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-green-200">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl flex flex-col border border-green-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
          <Recycle className="w-6 h-6" />
          <h1 className="font-semibold text-lg">CleanSight Assistant</h1>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-green-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl max-w-[80%] shadow-md transition break-words ${
                msg.role === "bot"
                  ? "bg-green-100 text-green-900 self-start rounded-bl-none"
                  : "bg-green-600 text-white self-end rounded-br-none"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="mb-2 max-h-60 rounded-lg border border-green-300"
                />
              )}
              {msg.role === "bot" ? (
                <div className="prose prose-green max-w-none break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {loading && (
            <p className="text-sm text-gray-500 animate-pulse">
              ⏳ CleanSight is thinking...
            </p>
          )}
        </div>

        <div className="p-3 border-t flex items-center gap-2 bg-white">
          <label className="cursor-pointer p-2 bg-green-100 rounded-full hover:bg-green-200 transition">
            <Upload className="w-5 h-5 text-green-700" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition"
            disabled={loading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
