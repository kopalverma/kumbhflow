import { useState, useRef, useEffect } from "react";
import { sendChat } from "../api";

interface Message {
  role: "user" | "ai";
  text: string;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Jai Mahakal! I am KumbhFlow AI. Ask me about crowd conditions, safe routes, or which ghats to avoid right now." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const reply = await sendChat(userMsg);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't connect to the server. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold text-white mb-3 px-3 pt-3">KumbhFlow AI</h2>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              m.role === "user"
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-100"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about any ghat..."
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;