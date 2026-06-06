import { useState, useRef, useEffect } from "react";
import { sendChat } from "../api";

interface Message {
  role: "user" | "ai";
  text: string;
}

const suggestions = [
  "Which ghat is safest right now?",
  "Best time to visit Ram Ghat?",
  "How crowded is Mahakaleshwar?",
  "Avoid which areas today?",
];

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "🙏 Jai Mahakal! I am your KumbhFlow AI Guide. I can help you find safe ghats, best visiting times, and crowd-free routes. How can I assist your darshan today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const reply = await sendChat(msg);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "ai",
        text: "🙏 I'm having trouble connecting. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-saffron/10 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-saffronLight border-2 border-saffron flex items-center justify-center text-lg">
          🙏
        </div>
        <div>
          <p className="text-gray-800 font-bold text-sm">KumbhFlow AI Guide</p>
          <p className="text-sage text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
            Powered by Gemini · Always available
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-saffronLight border border-saffron/30 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                🕉️
              </div>
            )}
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === "user"
                ? "bg-saffron text-white rounded-br-sm"
                : "bg-white text-gray-700 rounded-bl-sm border border-saffron/10"
            }`}>
              {typeof m.text === "string" ? m.text : JSON.stringify(m.text)}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-saffron flex items-center justify-center text-white text-xs ml-2 flex-shrink-0 mt-1 font-bold">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-saffronLight border border-saffron/30 flex items-center justify-center text-sm mr-2 flex-shrink-0">
              🕉️
            </div>
            <div className="bg-white border border-saffron/10 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-saffronSoft rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-saffronSoft rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-saffronSoft rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-cream border-t border-saffron/10">
          <p className="text-gray-400 text-xs mb-2 font-medium">Quick questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="bg-white border border-saffron/20 text-saffron text-xs px-3 py-1.5 rounded-full hover:bg-saffronLight transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 bg-white border-t border-saffron/10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about any ghat or route..."
          className="flex-1 bg-saffronLight text-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none border border-saffron/20 focus:border-saffron placeholder-gray-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="bg-saffron hover:bg-saffronSoft text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow"
        >
          🙏
        </button>
      </div>
    </div>
  );
};

export default ChatBot;