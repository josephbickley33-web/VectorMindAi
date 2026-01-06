"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AI_PERSONAS = {
  helpful: {
    name: "Helpful Assistant",
    description: "Friendly and helpful, provides detailed explanations",
    prompt: "You are a helpful, friendly assistant. Provide detailed, clear explanations.",
  },
  technical: {
    name: "Technical Expert",
    description: "Specialized in technical topics, code, and systems",
    prompt: "You are a technical expert. Provide accurate, detailed technical explanations with examples when relevant.",
  },
  creative: {
    name: "Creative Partner",
    description: "Helps with creative writing, brainstorming, and ideas",
    prompt: "You are a creative partner. Help generate ideas, write creatively, and think outside the box.",
  },
  teacher: {
    name: "Teacher",
    description: "Explains concepts clearly and educationally",
    prompt: "You are an excellent teacher. Explain concepts clearly, use examples, and adapt to the learner's level.",
  },
  casual: {
    name: "Casual Friend",
    description: "Relaxed and conversational tone",
    prompt: "You are a casual, friendly conversationalist. Keep responses natural and engaging.",
  },
};

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [persona, setPersona] = useState<keyof typeof AI_PERSONAS>("helpful");
  const [customPrompt, setCustomPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Load settings from localStorage
    const savedPersona = localStorage.getItem("ai_persona") as keyof typeof AI_PERSONAS;
    const savedPrompt = localStorage.getItem("ai_custom_prompt");
    if (savedPersona) setPersona(savedPersona);
    if (savedPrompt) setCustomPrompt(savedPrompt);
  }, []);

  const handleSave = () => {
    localStorage.setItem("ai_persona", persona);
    localStorage.setItem("ai_custom_prompt", customPrompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="flex items-center justify-center min-h-screen">Loading...</p>;
  if (!user) return null;

  const currentPersona = AI_PERSONAS[persona];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-700 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={() => router.push("/console")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          ← Back to Chat
        </button>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Profile */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <p className="text-slate-100">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* AI Persona */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">AI Personality</h2>
          <p className="text-slate-400 mb-4">
            Customize how the AI behaves and responds to you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(AI_PERSONAS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setPersona(key as keyof typeof AI_PERSONAS)}
                className={`p-4 rounded-lg text-left transition ${
                  persona === key
                    ? "bg-blue-600 border border-blue-500"
                    : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
                }`}
              >
                <p className="font-bold">{value.name}</p>
                <p className="text-sm text-slate-400">{value.description}</p>
              </button>
            ))}
          </div>

          <div className="bg-slate-800 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-400 mb-2">Current System Prompt:</p>
            <p className="text-slate-100">{currentPersona.prompt}</p>
          </div>
        </section>

        {/* Custom System Prompt */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Custom System Prompt</h2>
          <p className="text-slate-400 mb-4">
            Or define your own custom instruction for the AI
          </p>

          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter a custom system prompt... (optional, overrides persona if set)"
            className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded text-white text-sm resize-none"
          />

          {customPrompt && (
            <p className="text-xs text-blue-400 mt-2">
              ℹ️ Custom prompt will override the selected persona
            </p>
          )}
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded text-white font-bold"
          >
            Save Settings
          </button>
          {saved && (
            <p className="text-green-400">✓ Settings saved!</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
          <h3 className="font-bold mb-2">How it works</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>✓ Choose a predefined persona or create your own</li>
            <li>✓ The AI will follow your instructions in all conversations</li>
            <li>✓ Changes apply immediately to new messages</li>
            <li>✓ Settings are saved locally in your browser</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
