"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out VectorMind AI",
    features: [
      "50 AI requests per month",
      "Groq & Gemini (free providers)",
      "Basic chat interface",
      "7-day conversation history",
      "Community support",
    ],
    limitations: [
      "No OpenAI access",
      "No file uploads",
      "No voice features",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For professionals who need more power",
    features: [
      "Unlimited AI requests",
      "All providers (Groq, Gemini, OpenAI)",
      "Advanced features: voice, file upload, TTS",
      "AI comparison tool",
      "Unlimited conversation history",
      "Priority support",
      "Export conversations",
      "Share conversations",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    highlighted: true,
    priceId: "price_pro_monthly", // Replace with actual Stripe price ID
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For teams and businesses",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 10 users)",
      "API access",
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "White-label option",
    ],
    limitations: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId?: string) => {
    if (!priceId) {
      // Free tier or Enterprise - redirect to appropriate page
      if (!user) {
        router.push("/login");
      } else {
        router.push("/console-pro");
      }
      return;
    }

    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(priceId);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await res.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050711] via-[#0a0f1e] to-[#050711] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. All plans include our core AI features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                tier.highlighted
                  ? "bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500 shadow-2xl shadow-blue-500/20"
                  : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-400">/ {tier.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <button
                onClick={() => handleSubscribe(tier.priceId)}
                disabled={loading === tier.priceId}
                className={`w-full py-3 px-6 rounded-lg font-semibold mb-6 transition-all ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                }`}
              >
                {loading === tier.priceId ? "Processing..." : tier.cta}
              </button>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  What's included:
                </p>
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
                
                {tier.limitations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">Not included:</p>
                    {tier.limitations.map((limitation, idx) => (
                      <p key={idx} className="text-xs text-gray-600 ml-8">
                        • {limitation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400 text-sm">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400 text-sm">
                We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => router.push("/console-pro")}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            ← Back to Console
          </button>
        </div>
      </div>
    </main>
  );
}
