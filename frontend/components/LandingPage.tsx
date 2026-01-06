"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlans, SubscriptionPlan, defaultPlans } from "@/lib/subscriptions";
import LiveChatDemo from "@/components/LiveChatDemo";

export default function LandingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);

  useEffect(() => {
    // Load real plans from Supabase
    getPlans().then((fetchedPlans) => {
      if (fetchedPlans && fetchedPlans.length > 0) {
        setPlans(fetchedPlans);
      }
    });
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#15193b] via-[#050815] to-[#02030a] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-b from-[#050815]/95 via-[#050815]/78 to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#27e0c0] to-[#00b1ff] flex items-center justify-center font-bold text-[#050815]">
              V
            </div>
            <div>
              <div className="font-semibold text-lg tracking-wide">VectorMind AI</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.15em]">
                Applied Intelligence
              </div>
            </div>
          </Link>

          <div className="hidden md:flex gap-6 text-sm text-gray-400">
            <button onClick={() => scrollToSection("services")} className="hover:text-white transition">Services</button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-white transition">Subscriptions</button>
            <button onClick={() => scrollToSection("why-us")} className="hover:text-white transition">Why us</button>
            <button onClick={() => scrollToSection("contact")} className="hover:text-white transition">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-full border border-white/20 text-sm bg-[#050815]/75 hover:border-[#27e0c0] hover:text-white transition"
            >
              Access App
            </Link>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] text-[#050815] font-semibold text-sm hover:shadow-xl transition"
            >
              Book Call
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#27e0c0] animate-pulse"></span>
              <span>AI integration for real-world businesses</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              We turn your workflows into{" "}
              <span className="bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] bg-clip-text text-transparent">
                AI-powered systems
              </span>
              .
            </h1>

            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              VectorMind AI helps organisations of every size — from solo founders to enterprises — 
              plug real AI capabilities into existing tools and processes.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-2 rounded-lg bg-[#27e0c0]/10 text-[#27e0c0] text-sm border border-[#27e0c0]/30">
                Done-for-you AI workflows
              </span>
              <span className="px-4 py-2 rounded-lg bg-[#27e0c0]/10 text-[#27e0c0] text-sm border border-[#27e0c0]/30">
                Custom automations & agents
              </span>
              <span className="px-4 py-2 rounded-lg bg-[#27e0c0]/10 text-[#27e0c0] text-sm border border-[#27e0c0]/30">
                Flexible subscriptions
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/login"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] text-[#050815] font-semibold hover:shadow-2xl transition transform hover:-translate-y-0.5"
              >
                Sign Up & Start Free
              </Link>
              <button
                onClick={() => scrollToSection("contact")}
                className="px-8 py-3 rounded-full border border-white/20 hover:border-[#27e0c0] transition"
              >
                Schedule Discovery Call
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Start with what you already have — tools, people and processes.{" "}
              <span className="text-white">We layer AI on top, not chaos.</span>
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Average response time cut
                </div>
                <div className="text-lg font-medium">
                  <span className="text-[#27e0c0]">40–70%</span> faster
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Automation coverage
                </div>
                <div className="text-lg font-medium">
                  <span className="text-[#27e0c0]">30–60%</span> of tasks
                </div>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="bg-gradient-to-b from-[#27e0c0]/10 to-[#050815]/90 rounded-3xl border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">AI Integration Snapshot</h3>
              <span className="px-3 py-1 rounded-full bg-[#04d59c]/10 text-[#42f5c4] text-xs border border-[#27e0c0]/40">
                Live Project
              </span>
            </div>

            <div className="bg-[#050815]/90 rounded-2xl p-4 mb-4">
              <h4 className="text-sm text-gray-400 mb-3">Sales & Support Pipeline</h4>
              <div className="space-y-3">
                {[
                  { title: "Website assistant", desc: "Answers FAQs, captures leads", badge: "24/7" },
                  { title: "Lead qualification agent", desc: "Summarises & routes enquiries", badge: "−63% workload" },
                  { title: "CRM automation", desc: "Notes & follow-ups auto-drafted", badge: "Launch in 3 weeks" },
                ].map((step, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#0b1028]/95 rounded-xl p-3">
                    <div>
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-gray-400">{step.desc}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full border border-white/10 text-[#27e0c0] text-xs">
                      {step.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#050815]/70 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Projected annual impact</div>
              <div className="text-2xl font-semibold mb-2">
                +<span className="text-[#27e0c0]">£128,000</span> in team capacity
              </div>
              <div className="h-2 bg-[#0b1028] rounded-full overflow-hidden mb-2">
                <div className="h-full w-3/4 bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400">
                Based on time saved across support, sales and operations.
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-300 bg-[#050815]/50 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-[#42f5c4] animate-pulse"></span>
              <span>AI running quietly in the background, every day.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      <section className="py-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 justify-center">
            <span className="font-medium">We build on tools you already use:</span>
            {["OpenAI", "Microsoft 365", "Google Workspace", "Slack & Notion", "HubSpot & CRMs", "Zapier & APIs"].map((tool, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-[#050815]/90 border border-white/10">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm text-[#27e0c0] uppercase tracking-widest mb-3">Core Services</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The 5 AI capabilities every modern business needs.
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              We deliver the universal AI systems that reduce workload, increase conversions and unlock new revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                tag: "AI-AWI",
                title: "AI Automation & Workflow Integration",
                description: "Replace repetitive tasks with intelligent, automated systems.",
                features: [
                  "Automated lead capture & routing",
                  "AI-driven follow-up sequences",
                  "CRM automation",
                  "Document generation",
                  "Cross-tool integrations",
                ],
              },
              {
                tag: "AI-AA",
                title: "AI Agents & Assistants",
                description: "Deploy custom AI agents working 24/7 alongside your team.",
                features: [
                  "Sales qualification agents",
                  "Customer support assistants",
                  "Research & data-gathering",
                  "Internal productivity assistants",
                  "Website chat agents",
                ],
              },
              {
                tag: "NLP-S",
                title: "Natural Language Processing",
                description: "AI that understands and generates language to improve communication.",
                features: [
                  "AI-generated emails & proposals",
                  "Document summarisation",
                  "Smart FAQ systems",
                  "Content creation",
                  "Knowledge assistants",
                ],
              },
              {
                tag: "PAF",
                title: "Predictive Analytics & Forecasting",
                description: "Use your data to predict behavior and performance.",
                features: [
                  "Sales forecasting",
                  "Customer behavior prediction",
                  "Churn risk analysis",
                  "Marketing performance",
                  "Demand forecasting",
                ],
              },
              {
                tag: "AI-CXS",
                title: "AI-Enhanced Customer Experience",
                description: "Transform interactions into personalized experiences.",
                features: [
                  "Personalized recommendations",
                  "Smart onboarding flows",
                  "Sentiment analysis",
                  "Adaptive experiences",
                  "Journey mapping",
                ],
              },
            ].map((service, i) => (
              <div
                key={i}
                className="bg-[#050815]/60 rounded-2xl border border-white/10 p-6 hover:border-[#27e0c0]/50 transition group"
              >
                <div className="inline-block px-3 py-1 rounded-lg bg-[#27e0c0]/10 text-[#27e0c0] text-xs font-semibold mb-4 border border-[#27e0c0]/30">
                  {service.tag}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{service.description}</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-[#27e0c0] mt-0.5">▹</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Chat Demo */}
      <section className="py-20 bg-[#050815]/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-sm text-[#27e0c0] uppercase tracking-widest mb-3">Try it Now</div>
            <h2 className="text-4xl font-bold mb-4">Chat with VectorMind AI</h2>
            <p className="text-gray-300">Experience our AI assistant powered by multiple providers (Groq, Gemini, OpenAI)</p>
          </div>

          <LiveChatDemo />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm text-[#27e0c0] uppercase tracking-widest mb-3">Subscriptions</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Flexible plans for every business size
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Start free, scale as you grow. All plans include access to our multi-provider AI platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 transition ${
                  plan.tier === "pro"
                    ? "bg-gradient-to-b from-[#27e0c0]/10 to-[#050815] border-[#27e0c0]/50 scale-105"
                    : "bg-[#050815]/60 border-white/10"
                }`}
              >
                {plan.tier === "pro" && (
                  <div className="text-xs text-[#27e0c0] uppercase tracking-widest mb-2 font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-400 text-sm">/{plan.interval}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="text-[#27e0c0] mt-0.5">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/portal"
                  className={`block w-full py-3 rounded-xl text-center font-semibold transition ${
                    plan.tier === "pro"
                      ? "bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] text-[#050815] hover:shadow-xl"
                      : "border border-white/20 hover:border-[#27e0c0]"
                  }`}
                >
                  {plan.price === 0 ? "Start Free" : "Choose Plan"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 bg-[#050815]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-sm text-[#27e0c0] uppercase tracking-widest mb-3">Why Choose Us</div>
              <h2 className="text-4xl font-bold mb-6">
                Applied intelligence, not experiments.
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                We focus on outcomes: time saved, revenue gained, and smoother operations — 
                using the AI providers that best fit your context.
              </p>

              <div className="bg-gradient-to-b from-[#27e0c0]/5 to-[#050815] rounded-2xl border border-white/10 p-6">
                <p className="text-gray-300 italic mb-4">
                  "We plug AI into the systems you already rely on — email, chat, CRMs, documents and dashboards. 
                  The result is intelligence that feels invisible but is present in every workflow."
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Tool-agnostic", "Security aware", "Clear timelines", "Non-technical friendly"].map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-[#050815] border border-white/10 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-[#27e0c0] uppercase tracking-widest mb-3">Who This Is For</div>
              <h2 className="text-4xl font-bold mb-6">
                From solo operators to enterprise teams.
              </h2>

              <div className="bg-gradient-to-b from-[#27e0c0]/5 to-[#050815] rounded-2xl border border-white/10 p-6">
                <ul className="space-y-4 text-sm">
                  {[
                    { title: "Solo & micro-businesses", desc: "Replace manual admin without hiring" },
                    { title: "Agencies & consultancies", desc: "Productise services, improve delivery" },
                    { title: "E-commerce & retail", desc: "Optimise support and recommendations" },
                    { title: "Local service businesses", desc: "Automate enquiries and bookings" },
                    { title: "Corporate & enterprise", desc: "Pilot, then scale AI safely" },
                  ].map((item, i) => (
                    <li key={i}>
                      <span className="text-[#27e0c0] font-semibold">{item.title}:</span>{" "}
                      <span className="text-gray-400">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#27e0c0]/10 via-[#050815] to-[#00b1ff]/10 rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tell us what you want AI to fix first
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Send a short outline of your business and processes. We'll respond with concrete AI ideas 
                and suggest a project or subscription if it makes sense.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <strong className="text-sm">Email:</strong>
                  <a href="mailto:josephbickley33@gmail.com" className="block text-[#27e0c0] hover:underline">
                    josephbickley33@gmail.com
                  </a>
                </div>
                <div>
                  <strong className="text-sm">Phone:</strong>
                  <a href="tel:+441234567890" className="block text-[#27e0c0] hover:underline">
                    +44 1234 567 890
                  </a>
                </div>
                <div className="flex gap-3">
                  <a
                    href="mailto:josephbickley33@gmail.com?subject=AI%20Integration%20Enquiry"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] text-[#050815] font-semibold text-center hover:shadow-xl transition"
                  >
                    Email Us
                  </a>
                  <Link
                    href="/console"
                    className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-center hover:border-[#27e0c0] transition"
                  >
                    Try Console
                  </Link>
                </div>
              </div>

              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0b1028] border border-white/10 focus:border-[#27e0c0] focus:outline-none"
                />
                <textarea
                  rows={4}
                  placeholder="Describe your use case or challenge..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0b1028] border border-white/10 focus:border-[#27e0c0] focus:outline-none resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#27e0c0] to-[#00b1ff] text-[#050815] font-semibold hover:shadow-xl transition"
                >
                  Send Message
                </button>
                <p className="text-xs text-gray-400 text-center">
                  We typically respond within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © {new Date().getFullYear()} VectorMind AI. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</button>
              <Link href="/login">Login</Link>
              <Link href="/portal">Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
