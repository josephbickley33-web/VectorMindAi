"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/Loading";

interface Subscription {
  tier: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "past_due";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // TODO: Fetch subscription from database/Stripe
      // For now, mock data
      setSubscription({
        tier: "free",
        status: "active",
      });
      setLoadingSub(false);
    }
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setCancelling(true);
    try {
      // TODO: Call API to cancel subscription
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Subscription cancelled successfully");
    } catch (error) {
      alert("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || loadingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050711]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050711] via-[#0a0f1e] to-[#050711] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Subscription Management</h1>
          <button
            onClick={() => router.push("/settings")}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Settings
          </button>
        </div>

        {/* Current Plan */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold capitalize mb-2">
                {subscription?.tier || "Free"} Plan
              </p>
              <p className="text-gray-400">
                Status: <span className="text-green-500 capitalize">{subscription?.status}</span>
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="text-gray-400 text-sm mt-2">
                  {subscription.cancelAtPeriodEnd
                    ? `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/pricing")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {subscription?.tier === "free" ? "Upgrade Plan" : "Change Plan"}
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Usage This Month</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">AI Requests</p>
              <p className="text-3xl font-bold">--</p>
              <p className="text-xs text-gray-500 mt-1">
                {subscription?.tier === "free" ? "50 limit" : "Unlimited"}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Conversations</p>
              <p className="text-3xl font-bold">--</p>
              <p className="text-xs text-gray-500 mt-1">Total active</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Files Uploaded</p>
              <p className="text-3xl font-bold">--</p>
              <p className="text-xs text-gray-500 mt-1">
                {subscription?.tier === "free" ? "Not available" : "This month"}
              </p>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Billing History</h2>
          <p className="text-gray-400 text-sm">
            {subscription?.tier === "free"
              ? "No billing history for free tier"
              : "Your invoices will appear here"}
          </p>
          {/* TODO: Add invoice list */}
        </div>

        {/* Danger Zone */}
        {subscription?.tier !== "free" && !subscription?.cancelAtPeriodEnd && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Danger Zone</h2>
            <p className="text-gray-300 mb-4">
              Cancel your subscription and return to the free tier. You'll keep access until the end of your billing period.
            </p>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-6 py-3 rounded-lg text-red-400 hover:text-red-300 font-semibold transition-all disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
