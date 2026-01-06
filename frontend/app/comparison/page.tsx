"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingDots } from "@/components/ui/Loading";
import { Clock, DollarSign, Zap } from "lucide-react";

interface ComparisonResult {
  provider: string;
  response: string;
  timeMs: number;
  cost: number;
  error?: string;
}

const providerInfo = {
  groq: { name: "Groq", color: "from-orange-500 to-red-600", costPer1k: 0 },
  gemini: { name: "Gemini", color: "from-blue-500 to-purple-600", costPer1k: 0 },
  openai: { name: "OpenAI", color: "from-green-500 to-teal-600", costPer1k: 0.002 },
};

export default function ComparisonPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["groq", "gemini", "openai"]);

  const toggleProvider = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      setSelectedProviders(selectedProviders.filter((p) => p !== provider));
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  const runComparison = async () => {
    if (!prompt.trim() || selectedProviders.length === 0) return;

    setLoading(true);
    setResults([]);

    const promises = selectedProviders.map(async (provider) => {
      const startTime = Date.now();
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            provider,
            history: [],
          }),
        });

        const data = await res.json();
        const timeMs = Date.now() - startTime;

        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }

        // Estimate cost based on tokens (rough estimate: ~750 tokens for avg response)
        const estimatedTokens = data.response.length / 4;
        const cost = (estimatedTokens / 1000) * providerInfo[provider as keyof typeof providerInfo].costPer1k;

        return {
          provider,
          response: data.response,
          timeMs,
          cost,
        };
      } catch (error: any) {
        return {
          provider,
          response: "",
          timeMs: Date.now() - startTime,
          cost: 0,
          error: error.message,
        };
      }
    });

    const comparisonResults = await Promise.all(promises);
    setResults(comparisonResults);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runComparison();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050711] via-[#0a0f1e] to-[#050711] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Provider Comparison</h1>
            <p className="text-gray-400">
              Send the same prompt to multiple AI providers and compare speed, cost, and quality
            </p>
          </div>
          <button
            onClick={() => router.push("/console-pro")}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Console
          </button>
        </div>

        {/* Provider Selection */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Providers to Compare</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(providerInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => toggleProvider(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all border ${
                  selectedProviders.includes(key)
                    ? `bg-gradient-to-r ${info.color} border-transparent`
                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                }`}
              >
                {info.name}
                {info.costPer1k > 0 && (
                  <span className="ml-2 text-xs opacity-75">${info.costPer1k}/1k tokens</span>
                )}
                {info.costPer1k === 0 && (
                  <span className="ml-2 text-xs opacity-75">Free</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your prompt here... (Press Enter to run comparison)"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500"
            rows={4}
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-gray-500">
              {selectedProviders.length} provider{selectedProviders.length !== 1 ? "s" : ""} selected
            </p>
            <button
              onClick={runComparison}
              disabled={loading || !prompt.trim() || selectedProviders.length === 0}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Running Comparison..." : "Compare Providers"}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <LoadingDots />
            <p className="text-gray-400 mt-4">Querying {selectedProviders.length} providers...</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold">Fastest Response</h3>
                </div>
                <p className="text-2xl font-bold capitalize">
                  {[...results].sort((a, b) => a.timeMs - b.timeMs)[0]?.provider}
                </p>
                <p className="text-sm text-gray-400">
                  {[...results].sort((a, b) => a.timeMs - b.timeMs)[0]?.timeMs}ms
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Most Cost-Effective</h3>
                </div>
                <p className="text-2xl font-bold capitalize">
                  {[...results].filter(r => !r.error).sort((a, b) => a.cost - b.cost)[0]?.provider}
                </p>
                <p className="text-sm text-gray-400">
                  ${[...results].filter(r => !r.error).sort((a, b) => a.cost - b.cost)[0]?.cost.toFixed(4)}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Average Response Time</h3>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(results.reduce((sum, r) => sum + r.timeMs, 0) / results.length)}ms
                </p>
                <p className="text-sm text-gray-400">Across all providers</p>
              </div>
            </div>

            {/* Side-by-side Results */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div
                  key={result.provider}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold bg-gradient-to-r ${providerInfo[result.provider as keyof typeof providerInfo].color} bg-clip-text text-transparent`}>
                      {providerInfo[result.provider as keyof typeof providerInfo].name}
                    </h3>
                  </div>

                  {result.error ? (
                    <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
                      Error: {result.error}
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 bg-slate-800/50 rounded-lg p-4 mb-4 overflow-auto max-h-96">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {result.response}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Response Time</p>
                          <p className="font-semibold">{result.timeMs}ms</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Est. Cost</p>
                          <p className="font-semibold">
                            {result.cost === 0 ? "Free" : `$${result.cost.toFixed(4)}`}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p>Enter a prompt and select providers to start comparing</p>
          </div>
        )}
      </div>
    </main>
  );
}
