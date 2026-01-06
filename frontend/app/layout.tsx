import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: "VectorMind AI - Advanced AI Workflows",
    template: "%s | VectorMind AI",
  },
  description: "Multi-AI platform with intelligent workflow automation, advanced analytics, and enterprise-grade features. Built with Next.js, Supabase, and cutting-edge AI providers.",
  keywords: ["AI", "machine learning", "workflow automation", "analytics", "chatbot", "OpenAI", "Groq", "Gemini"],
  authors: [{ name: "VectorMind AI" }],
  creator: "VectorMind AI",
  publisher: "VectorMind AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vectormind.ai'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "VectorMind AI - Advanced AI Workflows",
    description: "Multi-AI platform with intelligent workflow automation",
    siteName: "VectorMind AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "VectorMind AI",
    description: "Multi-AI platform with intelligent workflow automation",
    creator: "@vectormindai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#050711" />
      </head>
      <body className="bg-[#050711] text-slate-100 antialiased">
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
