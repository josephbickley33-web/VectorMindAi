"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: string;
}

export default function LiveChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm VectorMind AI. I can help you understand how AI can transform your business workflows. Ask me anything about automation, customer experience, or predictive analytics!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          provider: data.provider,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again or sign up for the full experience.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#27e0c0]/10 to-[#050815] rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Chat messages */}
      <div className="bg-[#0b1028] rounded-xl p-4 mb-4 h-96 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex gap-3">
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#27e0c0] to-[#00b1ff] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#050815]">AI</span>
                </div>
              )}
              <div
                className={`rounded-xl p-3 flex-1 ${
                  message.role === "assistant"
                    ? "bg-[#050815]"
                    : "bg-gradient-to-r from-[#27e0c0]/20 to-[#00b1ff]/20 ml-auto max-w-[80%]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.provider && (
                  <p className="text-xs text-gray-400 mt-2">
                    Powered by {message.provider.toUpperCase()}
                  </p>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">U</span>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#27e0c0] to-[#00b1ff] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#050815]">AI</span>
              </div>
              <div className="bg-[#050815] rounded-xl p-3 flex-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#27e0c0] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#27e0c0] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-[#27e0c0] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            console.log("Input changing:", e.target.value);
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask about AI integration for your business..."
          disabled={loading}
          autoComplete="off"
          style={{ color: 'white', backgroundColor: '#0b1028' }}
          className="flex-1 px-4 py-3 rounded-xl border border-white/10 focus:border-[#27e0c0] focus:outline-none disabled:opacity-50 placeholder:text-gray-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] text-[#050815] font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        This is a live demo using our multi-provider AI system. Sign up for free to save your conversations!
      </p>
    </div>
  );
}
