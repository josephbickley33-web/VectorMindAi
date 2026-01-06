"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import {
  createConversation,
  getUserConversations,
  saveMessage,
  updateConversationTitle,
  deleteConversation,
  buildContextFromHistory,
  exportConversation,
  exportAllConversations,
  exportConversationToMarkdown,
  searchConversations,
  type Conversation,
} from "@/lib/chat-history";
import { useToast } from "@/components/ui/Toast";
import { LoadingSpinner, LoadingDots } from "@/components/ui/Loading";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const MAX_FILE_BYTES = 500 * 1024; // 500 KB limit for text/image loads
const MAX_PDF_BYTES = 2 * 1024 * 1024; // 2 MB soft limit for PDF extraction

function ConsolePro() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const demoUserId = "demo-user-local";  // Demo mode user ID
  const searchParams = useSearchParams();
  const { addToast, ToastContainer } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"auto" | "groq" | "gemini" | "openai">("auto");
  const [promptLibrary] = useState<string[]>([
    "Summarize the key insights and next actions from this text.",
    "Rewrite this in a concise, executive-friendly tone.",
    "Generate a step-by-step implementation plan with milestones.",
    "Extract risks, blockers, and mitigations from this description.",
    "Draft an outbound email with subject + body for this context.",
  ]);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sharingLink, setSharingLink] = useState<string | null>(null);
  const [importedShare, setImportedShare] = useState(false);
  const [sharePreview, setSharePreview] = useState<Conversation | null>(null);
  const [providerBadge, setProviderBadge] = useState<string>("Auto-select (fastest available)");
  const lastTranscriptRef = useRef<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice recognition setup (browser-only)
  const getRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition() as SpeechRecognitionType;
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
    }
    return recognitionRef.current;
  }, []);

  // Pull shared conversation from URL if present
  useEffect(() => {
    const shareId = searchParams?.get("share");
    if (!shareId || importedShare || sharePreview) return;
    try {
      const stored = localStorage.getItem(`share_${shareId}`);
      if (stored) {
        const conv = JSON.parse(stored);
        setSharePreview(conv);
        setSharingLink(`${window.location.origin}/console-pro?share=${shareId}`);
        addToast("Shared conversation ready to import", "info");
      }
    } catch (e) {
      console.warn("Failed to load shared conversation", e);
    }
  }, [searchParams, importedShare, sharePreview, addToast]);

  useEffect(() => {
    // Allow demo mode without authentication - don't redirect
    // This lets users see features without logging in
  }, []);

  useEffect(() => {
    const userId = user?.id || demoUserId;
    if (userId) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchConversations(conversations, searchQuery);
      setFilteredConversations(results);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  useEffect(() => {
    const badgeMap: Record<string, string> = {
      auto: "Auto-select (fastest available)",
      groq: "Groq (fast, $0)",
      gemini: "Gemini (fast, $0)",
      openai: "OpenAI (high quality, paid)",
    };
    setProviderBadge(badgeMap[selectedProvider]);
  }, [selectedProvider]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Ctrl/Cmd + N: New conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        newConversation();
      }
      // Ctrl/Cmd + /: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversations = async () => {
    const userId = user?.id || demoUserId;
    if (!userId) return;
    
    try {
      const convs = await getUserConversations(userId);
      setConversations(convs);
      setFilteredConversations(convs);
      
      if (convs.length > 0 && !currentConvId) {
        const firstConv = convs[0];
        setCurrentConvId(firstConv.id);
        setMessages(firstConv.messages || []);
        setIsLocalMode(firstConv.id.startsWith('local-') || firstConv.id.startsWith('emergency-'));
      }

      if (convs.length === 0) {
        const firstConvId = await createConversation(userId, "New Chat");
        if (firstConvId) {
          setCurrentConvId(firstConvId);
          setMessages([]);
          setIsLocalMode(firstConvId.startsWith('local-'));
          if (firstConvId.startsWith('local-')) {
            addToast("Using local mode - Supabase may need setup", "warning");
          }
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      addToast("Failed to load conversations. Check Supabase connectivity or retry sync.", "error");
    }
  };

  const newConversation = async () => {
    const userId = user?.id || demoUserId;
    if (!userId) return;
    
    const convId = await createConversation(userId, "New Chat");
    if (convId) {
      setCurrentConvId(convId);
      setMessages([]);
      setIsLocalMode(convId.startsWith('local-'));
      await loadConversations();
      addToast("New conversation started", "success");
      inputRef.current?.focus();
    }
  };

  const syncConversations = async () => {
    addToast("Syncing conversations...", "info");
    await loadConversations();
    addToast("Sync complete", "success");
  };

  const selectConversation = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      setCurrentConvId(convId);
      setMessages(conv.messages || []);
      setIsLocalMode(convId.startsWith('local-') || convId.startsWith('emergency-'));
      inputRef.current?.focus();
    }
  };

  const handleShare = () => {
    const conv = conversations.find((c) => c.id === currentConvId);
    if (!conv) {
      addToast("Select a conversation to share", "warning");
      return;
    }
    const shareId = `share-${Date.now()}`;
    try {
      localStorage.setItem(`share_${shareId}`, JSON.stringify(conv));
      const url = `${window.location.origin}/console-pro?share=${shareId}`;
      setSharingLink(url);
      navigator.clipboard?.writeText(url);
      addToast("Share link copied", "success");
    } catch {
      addToast("Could not create share link", "error");
    }
  };

  const acceptSharePreview = () => {
    if (!sharePreview) return;
    setMessages(sharePreview.messages || []);
    setCurrentConvId(sharePreview.id || null);
    setImportedShare(true);
    setSharePreview(null);
    setIsLocalMode(sharePreview.id?.startsWith('local-') || false);
    addToast("Shared conversation loaded", "success");
  };

  const dismissSharePreview = () => {
    setSharePreview(null);
    addToast("Share import dismissed", "info");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const kb = Math.round(file.size / 1024);
    const truncated = file.size > MAX_FILE_BYTES;
    setFileInfo(`${file.name} (${kb} KB${truncated ? ", truncated" : ""})`);

    const isText = file.type.startsWith("text") || [".txt", ".md", ".json"].some((ext) => file.name.endsWith(ext));
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      try {
        const limited = file.slice(0, MAX_PDF_BYTES);
        const buffer = await limited.arrayBuffer();
        const text = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(buffer));
        const cleaned = text.replace(/\s+/g, " ").trim();
        if (cleaned) {
          setFileContent(cleaned.slice(0, 8000));
          addToast("PDF text extracted (best effort)", "info");
        } else {
          setFileContent(`PDF uploaded: ${file.name} (${kb} KB). Summarize the document.`);
          addToast("Lightweight PDF extract unavailable; added placeholder", "warning");
        }
      } catch {
        setFileContent(`PDF uploaded: ${file.name} (${kb} KB). Summarize the document.`);
        addToast("PDF extract failed; added placeholder", "warning");
      }
      return;
    }

    if (isText) {
      const limited = truncated ? file.slice(0, MAX_FILE_BYTES) : file;
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || "";
        setFileContent(text.slice(0, 8000));
        addToast(truncated ? "File truncated to 500KB and loaded." : "File loaded. Click 'Insert file summary' to add to prompt.", "info");
      };
      reader.readAsText(limited);
    } else if (isImage) {
      setFileContent(`Image uploaded: ${file.name} (${kb} KB). Describe or summarize the image context.`);
      addToast("Image noted. Click 'Insert file summary' to add to prompt.", "info");
    } else {
      setFileContent(null);
      addToast("Unsupported file type. Use text, PDF, or image.", "warning");
    }
  };

  const insertFileSummary = () => {
    if (!fileContent) {
      addToast("No file content loaded", "warning");
      return;
    }
    setInput((prev) => `${prev}\n\nFile context:\n${fileContent}`.trim());
    addToast("File content inserted", "success");
  };

  const startListening = () => {
    const recognition = getRecognition();
    if (!recognition) {
      addToast("Speech recognition not supported in this browser", "warning");
      return;
    }
    setLiveTranscript("");
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const clean = transcript.trim();
      setLiveTranscript(clean);
      lastTranscriptRef.current = Date.now();
      setInput((prev) => `${prev} ${clean}`.trim());

      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
        addToast("Stopped after silence", "info");
      }, 3500);
    };
    recognition.onend = () => {
      setListening(false);
      setLiveTranscript("");
    };
    recognition.onerror = () => {
      setListening(false);
      setLiveTranscript("");
      addToast("Voice capture stopped", "warning");
    };
    recognition.start();
    setListening(true);
    addToast("Listening...", "info");
  };

  const stopListening = () => {
    const recognition = getRecognition();
    recognition?.stop();
    setListening(false);
    setLiveTranscript("");
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      addToast("Text-to-speech not supported", "warning");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Copy failed", "error");
    }
  };

  const handleRegenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      addToast("No user message to regenerate", "warning");
      return;
    }
    setInput(lastUser.content);
    await handleSend(lastUser.content, true);
  };

  const handleEditResend = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleSend = async (overrideText?: string, silent?: boolean) => {
    const outgoing = overrideText ?? input;
    if (!outgoing.trim() || sending) return;

    let activeConvId = currentConvId;
    const userId = user?.id || demoUserId;
    if (!activeConvId && userId) {
      activeConvId = await createConversation(userId, "New Chat");
      if (activeConvId) {
        setCurrentConvId(activeConvId);
        setIsLocalMode(activeConvId.startsWith('local-'));
        await loadConversations();
      }
    }

    if (!activeConvId) {
      addToast("Failed to create conversation", "error");
      return;
    }

    const userMessage: Message = { role: "user", content: outgoing };
    const userInput = outgoing;
    
    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput("");
    setSending(true);

    try {
      await saveMessage(activeConvId, userMessage);
      const context = buildContextFromHistory([...messages, userMessage], 4);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, history: context, provider: selectedProvider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        provider: data.provider,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(activeConvId, assistantMessage);

      if (messages.length === 0) {
        const title = userInput.substring(0, 50).trim();
        await updateConversationTitle(activeConvId, title);
        await loadConversations();
      }
    } catch (error) {
      console.error("Chat error:", error);
      if (!silent) addToast(error instanceof Error ? error.message : "Failed to get response", "error");
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
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    
    await deleteConversation(convId);
    if (currentConvId === convId) {
      setCurrentConvId(null);
      setMessages([]);
    }
    await loadConversations();
    addToast("Conversation deleted", "success");
  };

  const handleExport = (format: 'json' | 'markdown' | 'all') => {
    const conv = conversations.find(c => c.id === currentConvId);
    if (!conv && format !== 'all') {
      addToast("No conversation selected", "warning");
      return;
    }

    try {
      if (format === 'all') {
        exportAllConversations(conversations);
        addToast("All conversations exported", "success");
      } else if (format === 'json' && conv) {
        exportConversation(conv);
        addToast("Conversation exported as JSON", "success");
      } else if (format === 'markdown' && conv) {
        exportConversationToMarkdown(conv);
        addToast("Conversation exported as Markdown", "success");
      }
      setShowExportMenu(false);
    } catch {
      addToast("Export failed", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050711]">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <main className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#050711] via-[#0a0f1e] to-[#050711]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-full md:w-72" : "w-0"
          } transition-all duration-300 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 flex flex-col overflow-hidden`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={newConversation}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-4 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>New Chat</span>
              <span className="text-xs opacity-75">(Ctrl+N)</span>
            </button>
            
            {/* Search */}
            <div className="mt-3 relative">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search... (Ctrl+K)"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredConversations.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-8">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
            )}
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all ${
                  currentConvId === conv.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 shadow-lg"
                    : "bg-gray-800/30 hover:bg-gray-800/50 border border-transparent"
                }`}
              >
                <div
                  onClick={() => selectConversation(conv.id)}
                  className="flex items-start justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {conv.title || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {conv.messages?.length || 0} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConv(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 truncate">{user?.email || "Demo Mode"}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {conversations.length} conversations
                </p>
              </div>
              <button
                onClick={() => router.push("/settings")}
                className="text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
            <button
              onClick={user ? signOut : () => router.push("/login")}
              className={`w-full ${user ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/50 text-red-400 hover:text-red-300' : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-400 hover:text-blue-300'} border px-3 py-2 rounded-lg text-sm font-medium transition-all`}
            >
              {user ? "Sign Out" : "Login"}
            </button>

            <button
              onClick={syncConversations}
              className="w-full mt-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-gray-200 text-sm font-medium transition-all"
            >
              Sync now
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gray-900/30 backdrop-blur-xl border-b border-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:text-cyan-400 transition-colors text-xl"
              >
                {sidebarOpen ? "←" : "☰"}
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold gradient-text">VectorMind AI</h1>
                <p className="text-xs text-gray-500">Advanced Conversational AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isLocalMode && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <span className="text-xs text-yellow-400">⚠️ Local Mode</span>
                </div>
              )}

              {importedShare && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <span className="text-xs text-emerald-300">Imported share</span>
                </div>
              )}
              
              {messages.length > 0 && messages[messages.length - 1]?.provider && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <span className="text-xs text-cyan-400">
                    {messages[messages.length - 1].provider?.toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 px-3 py-1 rounded-lg">
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as any)}
                  disabled={sending}
                  className="bg-transparent text-sm text-white focus:outline-none disabled:opacity-60"
                >
                  <option value="auto">Auto</option>
                  <option value="groq">Groq</option>
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
                <span className="text-xs text-gray-400 hidden md:inline">{sending ? "Sending..." : providerBadge}</span>
              </div>

              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-white transition-colors"
                title="Share conversation"
              >
                🔗
              </button>

              <button
                onClick={() => {
                  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
                  if (!lastAssistant) {
                    addToast("No assistant reply to copy", "warning");
                    return;
                  }
                  handleCopy(lastAssistant.content);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy last AI reply"
              >
                📋
              </button>

              {sharingLink && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <span className="text-xs text-emerald-300 truncate max-w-xs">Link copied</span>
                  <button
                    onClick={() => handleCopy(sharingLink)}
                    className="text-emerald-200 hover:text-white text-xs"
                  >
                    Copy
                  </button>
                </div>
              )}

              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Export"
                >
                  📥
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-2 z-50">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-white"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('markdown')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-white"
                    >
                      Export as Markdown
                    </button>
                    <button
                      onClick={() => handleExport('all')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm text-white"
                    >
                      Export All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold mb-2 gradient-text">Start a Conversation</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                  Ask me anything! I can help with coding, writing, analysis, and more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                  {["Explain quantum computing", "Write a Python function", "Analyze this data", "Create a business plan"].map((example) => (
                    <button
                      key={example}
                      onClick={() => setInput(example)}
                      className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-2xl p-4 rounded-2xl text-sm md:text-base shadow-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-slate-100"
                  } group relative`}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                  {msg.provider && msg.role === "assistant" && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <span>⚡</span>
                      <span>{msg.provider.toUpperCase()}</span>
                    </p>
                  )}
                    <div className="flex gap-2 mt-3 text-xs text-gray-300 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                      <button onClick={() => handleCopy(msg.content)} className="hover:text-white transition-colors">Copy</button>
                      <span className="text-gray-600">•</span>
                      <button onClick={() => speakMessage(msg.content)} className="hover:text-white transition-colors">Speak</button>
                      {msg.role === "assistant" && (
                        <>
                          <span className="text-gray-600">•</span>
                          <button onClick={handleRegenerate} className="hover:text-white transition-colors">Regenerate</button>
                        </>
                      )}
                      {msg.role === "user" && (
                        <>
                          <span className="text-gray-600">•</span>
                          <button onClick={() => handleEditResend(msg.content)} className="hover:text-white transition-colors">Edit & Resend</button>
                        </>
                      )}
                    </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-4 rounded-2xl">
                  <LoadingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-gray-900/30 backdrop-blur-xl border-t border-gray-800 p-4">
            <div className="max-w-4xl mx-auto mb-3 flex flex-wrap gap-2">
              {promptLibrary.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="max-w-4xl mx-auto mb-3 flex flex-wrap items-center gap-3 text-sm">
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,.pdf,image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-200 transition-colors">
                📎 Upload
              </label>
              {fileInfo && <span className="text-gray-400">{fileInfo}</span>}
              {fileContent && (
                <button onClick={insertFileSummary} className="px-3 py-2 bg-cyan-600/80 hover:bg-cyan-600 rounded-lg text-white transition-colors">
                  Insert file summary
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`px-3 py-2 rounded-lg border ${listening ? "border-red-500 text-red-400" : "border-gray-700 text-gray-200 hover:bg-gray-800"}`}
                >
                  {listening ? "Stop" : "Voice"}
                </button>
                <button
                  onClick={() => {
                    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
                    if (lastAssistant) speakMessage(lastAssistant.content);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                >
                  Play AI
                </button>
                {liveTranscript && (
                  <span className="text-xs text-gray-300 bg-gray-800/70 border border-gray-700 rounded-lg px-3 py-2 whitespace-pre-wrap">
                    {liveTranscript}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 max-w-4xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message... (Ctrl+/ to focus)"
                disabled={sending}
                autoComplete="off"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {sending ? <LoadingDots /> : "Send"}
              </button>
            </div>
            
            {isLocalMode && (
              <p className="text-xs text-yellow-400 mt-2 text-center max-w-4xl mx-auto">
                ⚠️ Local mode - Messages saved to browser only. <a href="/TURN_OFF_LOCAL_MODE.md" className="underline hover:text-yellow-300">Setup Supabase</a>
              </p>
            )}
            
            <p className="text-xs text-gray-600 mt-2 text-center">
              Powered by multi-AI platform • Groq • Gemini • OpenAI
            </p>
          </div>
        </div>
      </main>

      {sharePreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Import shared conversation?</h3>
            <p className="text-sm text-gray-400">Preview the first messages before loading.</p>
            <div className="max-h-64 overflow-y-auto space-y-3 bg-gray-800/40 border border-gray-800 rounded-xl p-3">
              {(sharePreview.messages || []).slice(0, 6).map((m, idx) => (
                <div key={idx} className="text-sm text-gray-200 border border-gray-800 rounded-lg p-2 bg-gray-800/60">
                  <div className="text-xs uppercase text-gray-500 mb-1">{m.role}</div>
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                </div>
              ))}
              {(sharePreview.messages || []).length > 6 && (
                <p className="text-xs text-gray-500">…and more</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={dismissSharePreview}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={acceptSharePreview}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all"
              >
                Import & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ConsoleProPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050711]"><LoadingSpinner size="lg" /></div>}>
      <ConsolePro />
    </Suspense>
  );
}
