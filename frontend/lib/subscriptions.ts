import { supabase } from "@/lib/supabase";

export type SubscriptionPlan = {
  id?: string;
  name: string;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
  maxMessages?: number;
  maxContextTokens?: number;
  aiProviders?: string[];
  isActive?: boolean;
  tier?: "free" | "pro" | "enterprise";
};

export const defaultPlans: SubscriptionPlan[] = [
  {
    name: "Starter",
    price: 0,
    currency: "USD",
    interval: "monthly",
    features: [
      "Groq access (fast & free)",
      "Basic chat history",
      "2K context window",
    ],
    maxMessages: 100,
    maxContextTokens: 2000,
    aiProviders: ["groq"],
    isActive: true,
    tier: "free",
  },
  {
    name: "Pro",
    price: 29,
    currency: "USD",
    interval: "monthly",
    features: [
      "Groq + Gemini",
      "Full chat history",
      "8K context window",
      "Priority routing",
    ],
    maxMessages: 2000,
    maxContextTokens: 8000,
    aiProviders: ["groq", "gemini"],
    isActive: true,
    tier: "pro",
  },
  {
    name: "Enterprise",
    price: 99,
    currency: "USD",
    interval: "monthly",
    features: [
      "Groq + Gemini + OpenAI",
      "Unlimited history",
      "32K+ context window",
      "SLA & audit logs",
    ],
    maxMessages: 10000,
    maxContextTokens: 32000,
    aiProviders: ["groq", "gemini", "openai"],
    isActive: true,
    tier: "enterprise",
  },
];

function handleSupabaseError(error: any, fallback: any) {
  console.error("Supabase error:", error?.message || error);
  return fallback;
}

export async function getPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) return handleSupabaseError(error, defaultPlans);
    if (!data || data.length === 0) return defaultPlans;

    return data as SubscriptionPlan[];
  } catch (error) {
    return handleSupabaseError(error, defaultPlans);
  }
}

export async function upsertPlan(plan: SubscriptionPlan) {
  try {
    const { data, error } = await supabase
      .from("plans")
      .upsert(plan)
      .select()
      .single();

    if (error) throw error;
    return data as SubscriptionPlan;
  } catch (error) {
    return handleSupabaseError(error, null);
  }
}

export async function deletePlan(planId: string) {
  try {
    const { error } = await supabase.from("plans").delete().eq("id", planId);
    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError(error, false);
  }
}

export async function getUserPlan(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_plans")
      .select("plan_id, plans(*)")
      .eq("user_id", userId)
      .single();

    if (error) return handleSupabaseError(error, null);
    return (data as any)?.plans as SubscriptionPlan | null;
  } catch (error) {
    return handleSupabaseError(error, null);
  }
}

export async function assignPlanToUser(userId: string, planId: string) {
  try {
    const { error } = await supabase
      .from("user_plans")
      .upsert({ user_id: userId, plan_id: planId });

    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError(error, false);
  }
}
