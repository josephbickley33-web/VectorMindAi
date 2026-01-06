"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  createConversation,
  getUserConversations,
  saveMessage,
  updateConversationTitle,
  deleteConversation,
  buildContextFromHistory,
} from "@/lib/chat-history";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
}

interface ConversationData {
  id: string;
  title: string;
  messages: Message[];
}

export default function Console() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!user?.id) return;
    
    try {
      const convs = await getUserConversations(user.id);
      setConversations(convs as any);
      
      if (convs.length > 0 && !currentConvId) {
        const firstConv = convs[0];
        setCurrentConvId(firstConv.id);
        
        // Try to load from localStorage first, fallback to Supabase data
        try {
          const stored = localStorage.getItem(`conv_${firstConv.id}`);
          if (stored) {
            console.log("Loading messages from localStorage");
            setMessages(JSON.parse(stored));
          } else {
            setMessages(firstConv.messages || []);
          }
        } catch {
          setMessages(firstConv.messages || []);
        }
      }

      // If the user has no conversations yet, create one automatically
      if (convs.length === 0) {
        console.log("No conversations found, creating first one...");
        const firstConvId = await createConversation(user.id, "New Chat");
        console.log("Created conversation ID:", firstConvId);
        
        if (firstConvId) {
          setCurrentConvId(firstConvId);
          setMessages([]);
          
          // If it's a local ID (Supabase failed), show a warning
          if (firstConvId.startsWith('local-')) {
            console.warn("Using local-only mode - messages saved to localStorage only");
          }
        } else {
          console.error("Failed to create conversation, creating emergency local ID");
          // Emergency fallback
          const emergencyId = `emergency-${Date.now()}`;
          setCurrentConvId(emergencyId);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      // Emergency fallback - always allow chatting
      const emergencyId = `emergency-${Date.now()}`;
      setCurrentConvId(emergencyId);
      
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(`conv_${emergencyId}`);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }
    }
  };

  const newConversation = async () => {
    if (!user?.id) return;
    const convId = await createConversation(user.id, "New Chat");
    if (convId) {
      setCurrentConvId(convId);
      setMessages([]);
      await loadConversations();
    }
  };

  const selectConversation = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      setCurrentConvId(convId);
      setMessages(conv.messages || []);
    } else {
      // Try to load from localStorage as fallback
      try {
        const stored = localStorage.getItem(`conv_${convId}`);
        if (stored) {
          console.log("Loading conversation from localStorage");
          setCurrentConvId(convId);
          setMessages(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Could not load from localStorage:", e);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    // Ensure a conversation exists before sending
    let activeConvId = currentConvId;
    if (!activeConvId && user?.id) {
      console.log("Creating new conversation...");
      activeConvId = await createConversation(user.id, "New Chat");
      if (activeConvId) {
        setCurrentConvId(activeConvId);
        setMessages([]);
        await loadConversations();
      }
    }

    if (!activeConvId) {
      console.error("No conversation ID available");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    const userInput = input;
    
    // CRITICAL: Add user message to state IMMEDIATELY
    console.log("Adding user message to UI:", userInput);
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      // Also save to localStorage as backup
      try {
        localStorage.setItem(`conv_${activeConvId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return updated;
    });
    
    setInput("");
    setSending(true);

    try {
      // Try to save user message to Supabase (non-blocking)
      saveMessage(activeConvId, userMessage).catch(err => 
        console.warn("Supabase save failed, but message is in UI:", err)
      );

      // Build compact history for context-aware responses
      const context = buildContextFromHistory([...messages, userMessage], 4);

      console.log("Calling chat API...");
      // Call API with conversation history
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          history: context,
        }),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        provider: data.provider,
      };

      // CRITICAL: Add assistant message to state IMMEDIATELY
      console.log("Adding assistant message to UI");
      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        // Save to localStorage as backup
        try {
          localStorage.setItem(`conv_${activeConvId}`, JSON.stringify(updated));
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }
        return updated;
      });
      
      // Try to save to Supabase (non-blocking)
      saveMessage(activeConvId, assistantMessage).catch(err =>
        console.warn("Supabase save failed, but message is in UI:", err)
      );

      // Auto-generate title if first message
      if (messages.length === 0) {
        const title = userInput.substring(0, 50).trim();
        await updateConversationTitle(activeConvId, title);
        await loadConversations();
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConv = async (convId: string) => {
    if (!confirm("Delete this conversation?")) return;
    await deleteConversation(convId);
    if (currentConvId === convId) {
      setCurrentConvId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  if (loading) return <p className="flex items-center justify-center min-h-screen">Loading...</p>;
  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-full md:w-64" : "w-0"
        } transition-all duration-300 bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={newConversation}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-bold"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded cursor-pointer transition ${
                currentConvId === conv.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <p
                onClick={() => selectConversation(conv.id)}
                className="truncate text-sm font-medium"
              >
                {conv.title || "Untitled"}
              </p>
              <button
                onClick={() => handleDeleteConv(conv.id)}
                className="text-xs text-red-400 hover:text-red-300 mt-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
          >
            Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900/50 border-b border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white hover:text-blue-400"
            >
              ☰
            </button>
            <h1 className="text-xl md:text-2xl font-bold">VectorMind AI</h1>
          </div>
          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <p className="text-xs md:text-sm text-slate-400">
                {messages[messages.length - 1]?.provider
                  ? `Powered by ${messages[messages.length - 1].provider?.toUpperCase()}`
                  : ""}
              </p>
            )}
            <button
              onClick={() => router.push("/settings")}
              className="text-white hover:text-blue-400 text-sm"
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400 text-center">Start a conversation...</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-2xl p-4 rounded-lg text-sm md:text-base ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                <p className="break-words">{msg.content}</p>
                {msg.provider && msg.role === "assistant" && (
                  <p className="text-xs text-slate-400 mt-2">
                    {msg.provider.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-slate-900/50 border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                console.log("Console input change:", e.target.value);
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={currentConvId ? "Type a message..." : "Creating conversation..."}
              disabled={sending}
              autoComplete="off"
              style={{ color: 'white', backgroundColor: '#1e293b' }}
              className="flex-1 px-4 py-2 border border-slate-700 rounded text-sm md:text-base disabled:opacity-50 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-4 md:px-6 py-2 rounded text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
          {!currentConvId && (
            <p className="text-xs text-yellow-400 mt-2">
              Setting up your conversation... If this persists, refresh the page or try <a href="/simple-chat" className="underline">Simple Chat</a>.
            </p>
          )}
          {currentConvId && (currentConvId.startsWith('local-') || currentConvId.startsWith('emergency-')) && (
            <p className="text-xs text-blue-400 mt-2">
              ⚠️ Local mode active - Your messages won't be saved. Supabase tables may need to be set up.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}