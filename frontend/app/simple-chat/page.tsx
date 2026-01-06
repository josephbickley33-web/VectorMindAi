"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: string;
}

export default function SimpleConsole() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-focus input
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || sending) {
      console.log("Cannot send:", { input: input.trim(), sending });
      return;
    }

    const userMessage = input.trim();
    console.log("Sending message:", userMessage);
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setSending(true);

    try {
      console.log("Calling API...");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      console.log("API response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();
      console.log("API response data:", data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          provider: data.provider,
        },
      ]);
    } catch (error: any) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}. Please check your API keys in .env.local`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Enter pressed, sending...");
      handleSend();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold">VectorMind AI Console (Simple Mode)</h1>
        <p className="text-sm text-gray-400">No login required - Just chat!</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to VectorMind AI</h2>
              <p className="text-gray-400">Type a message below to start chatting</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              <p className="break-words whitespace-pre-wrap">{msg.content}</p>
              {msg.provider && msg.role === "assistant" && (
                <p className="text-xs text-slate-400 mt-2">
                  Powered by {msg.provider.toUpperCase()}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-900/50 border-t border-slate-700 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              console.log("Input changed:", e.target.value);
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={sending}
            autoComplete="off"
            style={{ 
              color: 'white', 
              backgroundColor: '#1e293b',
              WebkitUserSelect: 'text',
              userSelect: 'text'
            }}
            className="flex-1 px-4 py-3 border border-slate-700 rounded-lg text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
          />
          <button
            onClick={() => {
              console.log("Send button clicked");
              handleSend();
            }}
            disabled={sending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2">
          <p className="text-xs text-gray-400">
            Press Enter to send • Current input: "{input}" • Can send: {!sending && input.trim() ? "YES" : "NO"}
          </p>
        </div>
      </div>
    </main>
  );
}
