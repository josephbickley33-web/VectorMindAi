"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ToolCard {
  title: string;
  description: string;
  href: string;
  badge?: string;
  external?: boolean;
}

const tools: ToolCard[] = [
  {
    title: "Pro Chat Console",
    description: "Full multi-AI chat with search, export, keyboard shortcuts, and rich UI.",
    href: "/console-pro",
    badge: "Recommended",
  },
  {
    title: "AI Comparison",
    description: "Compare responses from multiple AI providers side-by-side with metrics.",
    href: "/comparison",
    badge: "New",
  },
  {
    title: "Pricing & Plans",
    description: "View pricing tiers and manage your subscription.",
    href: "/pricing",
  },
  {
    title: "Standard Console",
    description: "Original authenticated console with conversation management.",
    href: "/console",
  },
  {
    title: "Simple Chat (no auth)",
    description: "Lightweight chat for quick tests without logging in.",
    href: "/simple-chat",
  },
  {
    title: "Portal (Plans)",
    description: "Manage plans, providers, and assign subscriptions to users.",
    href: "/portal",
  },
  {
    title: "Settings",
    description: "Adjust AI persona, custom prompt, and preferences.",
    href: "/settings",
  },
  {
    title: "Subscription",
    description: "Manage your subscription, view usage, and billing history.",
    href: "/subscription",
  },
  {
    title: "Landing Demo",
    description: "Marketing site with live demo widget and sections.",
    href: "/",
  },
  {
    title: "Backend API Tester",
    description: "HTML tester for backend endpoints (sentiment, etc.).",
    href: "/test-api.html",
    badge: "HTML",
    external: true,
  },
  {
    title: "Input Diagnostics",
    description: "Debug input focus/typing issues (local-only test).",
    href: "/test-input",
  },
];

export default function MenuPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050711] text-white">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050711] via-[#0a0f1e] to-[#050711] text-slate-100 px-4 py-10 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">VectorMind AI</p>
            <h1 className="text-3xl font-bold">Choose a workspace</h1>
            <p className="text-slate-400 mt-2">
              Pick a tool to launch. You can always come back here to switch.
            </p>
          </div>
          <Link
            href="/console-pro"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/40 transition"
          >
            Open Pro Console
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="border border-gray-800 bg-gray-900/40 rounded-2xl p-4 flex flex-col gap-3 hover:border-cyan-500/50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-6">{tool.description}</p>
                </div>
                {tool.badge && (
                  <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    {tool.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={tool.href}
                  target={tool.external ? "_blank" : undefined}
                  rel={tool.external ? "noreferrer" : undefined}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition border border-slate-700 hover:border-cyan-500/50"
                >
                  Open
                </Link>
                {tool.external && (
                  <span className="text-xs text-slate-500">Opens in new tab</span>
                )}
              </div>
            </div>
          ))}
        </section>

        <div className="border border-amber-500/30 bg-amber-500/10 text-amber-100 rounded-2xl p-4 text-sm leading-6">
          <div className="font-semibold mb-1">Local mode reminder</div>
          <p>
            If you see a "Local mode" warning in chat, run the Supabase schema to enable cloud saves:
            open Supabase SQL editor and run the contents of <span className="underline">supabase-schema.sql</span>, then refresh the app.
          </p>
        </div>
      </div>
    </main>
  );
}
