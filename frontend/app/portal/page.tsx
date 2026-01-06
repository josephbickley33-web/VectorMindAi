"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  assignPlanToUser,
  defaultPlans,
  getPlans,
  getUserPlan,
  upsertPlan,
  SubscriptionPlan,
} from "@/lib/subscriptions";

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-100">
      {label}
    </span>
  );
}

export default function PortalPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan | null>(null);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminEmails = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    return raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const fetchedPlans = await getPlans();
        setPlans(fetchedPlans || defaultPlans);

        if (user?.id) {
          const currentPlan = await getUserPlan(user.id);
          setUserPlan(currentPlan);
        }
      } catch (err: any) {
        console.error("Portal bootstrap error", err);
        setError("Unable to load plans right now. Using defaults.");
        setPlans(defaultPlans);
      }
    };
    bootstrap();
  }, [user?.id]);

  const handleAssignPlan = async (planId: string) => {
    if (!user?.id) {
      router.push("/login");
      return;
    }
    setAssigning(true);
    setError(null);
    try {
      await assignPlanToUser(user.id, planId);
      const selected = plans.find((p) => p.id === planId) || defaultPlans.find((p) => p.name === "Starter") || null;
      setUserPlan(selected || null);
    } catch (err: any) {
      setError(err?.message || "Failed to assign plan");
    } finally {
      setAssigning(false);
    }
  };

  const handleSavePlan = async (plan: SubscriptionPlan) => {
    if (!isAdmin) return;
    setSavingPlanId(plan.id || plan.name);
    setError(null);
    try {
      const saved = await upsertPlan(plan);
      if (saved) {
        setPlans((prev) => {
          const without = prev.filter((p) => (p.id || p.name) !== (plan.id || plan.name));
          return [...without, saved];
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save plan");
    } finally {
      setSavingPlanId(null);
    }
  };

  const setPlanField = (planIdx: number, field: keyof SubscriptionPlan, value: any) => {
    setPlans((prev) => {
      const next = [...prev];
      next[planIdx] = { ...next[planIdx], [field]: value };
      return next;
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">VectorMind AI Portal</p>
            <h1 className="text-3xl font-bold">AI Access & Subscriptions</h1>
            <p className="text-slate-400 mt-2">
              Manage AI providers, limits, and plans. Admins can edit plans; users can pick their plan.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/console")}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              Open Console
            </button>
            {!user && (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded border border-slate-700 hover:border-blue-500"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="p-4 rounded border border-red-400 bg-red-900/20 text-red-200 text-sm">{error}</div>
        )}

        {user && (
          <div className="p-4 rounded border border-slate-800 bg-slate-900/60">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="font-semibold">{user.email}</p>
            <p className="text-sm text-slate-400 mt-1">
              {isAdmin ? "Admin access: you can edit plans" : "User access: choose a plan below"}
            </p>
            {userPlan && (
              <div className="mt-3 text-sm text-green-300">Current plan: {userPlan.name}</div>
            )}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {plans
            .sort((a, b) => a.price - b.price)
            .map((plan, idx) => {
              const isCurrent = !!(userPlan && (userPlan.id === plan.id || userPlan.name === plan.name));
              return (
                <div
                  key={plan.id || plan.name}
                  className={`border rounded-lg p-4 bg-slate-900/50 border-slate-800 flex flex-col gap-3 ${
                    isCurrent ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-slate-400 text-sm">{plan.interval === "yearly" ? "Billed yearly" : "Billed monthly"}</p>
                    </div>
                    {plan.price === 0 ? (
                      <p className="text-lg font-semibold">Free</p>
                    ) : (
                      <p className="text-lg font-semibold">
                        ${plan.price}
                        <span className="text-xs text-slate-400">/{plan.interval === "yearly" ? "yr" : "mo"}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(plan.aiProviders || []).map((p) => (
                      <FeatureBadge key={p} label={p.toUpperCase()} />
                    ))}
                  </div>

                  <div className="space-y-1 text-sm text-slate-300">
                    {plan.features?.map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <span className="mt-1 text-green-400">•</span>
                        <span className="leading-5">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="space-y-2 border-t border-slate-800 pt-3 text-sm">
                      <div className="flex gap-2 items-center">
                        <label className="w-32 text-slate-400">Price</label>
                        <input
                          type="number"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1"
                          value={plan.price}
                          onChange={(e) => setPlanField(idx, "price", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <label className="w-32 text-slate-400">Max msgs</label>
                        <input
                          type="number"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1"
                          value={plan.maxMessages || 0}
                          onChange={(e) => setPlanField(idx, "maxMessages", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <label className="w-32 text-slate-400">Providers</label>
                        <input
                          type="text"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1"
                          value={(plan.aiProviders || []).join(",")}
                          onChange={(e) =>
                            setPlanField(
                              idx,
                              "aiProviders",
                              e.target.value.split(",").map((p) => p.trim()).filter(Boolean)
                            )
                          }
                        />
                      </div>
                      <button
                        onClick={() => handleSavePlan(plan)}
                        disabled={savingPlanId === (plan.id || plan.name)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold disabled:opacity-60"
                      >
                        {savingPlanId === (plan.id || plan.name) ? "Saving..." : "Save plan"}
                      </button>
                    </div>
                  )}

                  {!isAdmin && (
                    <button
                      onClick={() => handleAssignPlan(plan.id || plan.name)}
                      disabled={assigning || isCurrent}
                      className={`w-full py-2 rounded font-semibold ${
                        isCurrent
                          ? "bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      } disabled:opacity-60`}
                    >
                      {isCurrent ? "Current plan" : assigning ? "Assigning..." : "Choose plan"}
                    </button>
                  )}

                  {isAdmin && !plan.id && (
                    <p className="text-xs text-amber-300">Saving will create this plan in Supabase (table: plans).</p>
                  )}
                </div>
              );
            })}
        </section>

        <section className="border border-slate-800 rounded-lg p-4 bg-slate-900/60">
          <h2 className="text-xl font-semibold mb-2">How subscriptions control AI features</h2>
          <p className="text-slate-300 text-sm leading-6">
            • Providers: choose which AI engines each tier can access (Groq, Gemini, OpenAI).<br />
            • Limits: set monthly message caps and context sizes to control cost.<br />
            • Access: assigning a plan to a user (or setting a default) enforces these limits in the UI.
          </p>
        </section>
      </div>
    </div>
  );
}
