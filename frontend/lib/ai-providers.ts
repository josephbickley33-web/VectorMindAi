import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = "groq" | "gemini" | "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  response: string;
  provider: AIProvider;
  tokensUsed?: number;
}

/**
 * Try Groq first (FREE & FAST)
 */
async function tryGroq(messages: ChatMessage[]): Promise<AIResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === "your-groq-key-here") {
    return null;
  }

  try {
    const groq = new Groq({ apiKey });
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast, free, and powerful
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      return {
        response,
        provider: "groq",
        tokensUsed: completion.usage?.total_tokens
      };
    }
  } catch (error: any) {
    console.log("Groq failed, trying next provider:", error.message);
  }
  
  return null;
}

/**
 * Try Google Gemini (FREE tier available)
 */
async function tryGemini(messages: ChatMessage[]): Promise<AIResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your-gemini-key-here") {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Combine system message with user message for Gemini
    const systemMsg = messages.find(m => m.role === "system")?.content || "";
    const userMsg = messages.find(m => m.role === "user")?.content || "";
    
    const prompt = systemMsg 
      ? `${systemMsg}\n\nUser: ${userMsg}`
      : userMsg;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    if (response) {
      return {
        response,
        provider: "gemini"
      };
    }
  } catch (error: any) {
    console.log("Gemini failed, trying next provider:", error.message);
  }
  
  return null;
}

/**
 * Fallback to OpenAI (if quota allows)
 */
async function tryOpenAI(messages: ChatMessage[]): Promise<AIResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes("YOUR") || apiKey.includes("your-")) {
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      return {
        response,
        provider: "openai",
        tokensUsed: completion.usage?.total_tokens
      };
    }
  } catch (error: any) {
    console.log("OpenAI failed:", error.message);
  }
  
  return null;
}

/**
 * Main function: Tries providers in order (Groq -> Gemini -> OpenAI)
 * Returns first successful response
 */
export async function getChatCompletion(
  userMessage: string,
  systemMessage: string = "You are VectorMind AI, a helpful, intelligent, and friendly assistant.",
  preferredProvider: AIProvider | "auto" = "auto"
): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage }
  ];

  // Build ordered list based on preference
  const providerOrder: AIProvider[] = (() => {
    if (preferredProvider === "auto") return ["groq", "gemini", "openai"];
    const others = ["groq", "gemini", "openai"].filter((p) => p !== preferredProvider) as AIProvider[];
    return [preferredProvider, ...others];
  })();

  console.log("🤖 Trying AI providers in order:", providerOrder.join(" -> "));

  for (const provider of providerOrder) {
    if (provider === "groq") {
      const res = await tryGroq(messages);
      if (res) {
        console.log("✅ Groq succeeded");
        return res;
      }
    }
    if (provider === "gemini") {
      const res = await tryGemini(messages);
      if (res) {
        console.log("✅ Gemini succeeded");
        return res;
      }
    }
    if (provider === "openai") {
      const res = await tryOpenAI(messages);
      if (res) {
        console.log("✅ OpenAI succeeded");
        return res;
      }
    }
  }

  // All providers failed
  throw new Error(
    "All AI providers are unavailable. Please check your API keys and try again."
  );
}
