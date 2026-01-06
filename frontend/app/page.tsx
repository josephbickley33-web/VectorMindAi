import LandingPage from "@/components/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VectorMind AI - Practical AI Integration for Modern Businesses",
  description: "Transform your workflows with AI-powered systems. From automation to predictive analytics, we help businesses of all sizes integrate AI into real processes.",
};

export default function Home() {
  return <LandingPage />;
}
