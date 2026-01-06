import { NextRequest, NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/ai-providers";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] === Chat API Request Started ===`);
  const startTime = Date.now();
  
  try {
    // Validate request body
    let message: string;
    let conversationHistory: string = "";
    let preferredProvider: any = "auto";
    
    try {
      const body = await req.json();
      message = body.message;
      conversationHistory = body.history || ""; // Optional conversation context
      preferredProvider = body.provider || "auto";
      
      if (!message) {
        console.warn(`[${requestId}] Missing message in request body`);
        return NextResponse.json(
          { error: "Message is required" },
          { status: 400 }
        );
      }
      
      if (typeof message !== "string") {
        console.warn(`[${requestId}] Message is not a string: ${typeof message}`);
        return NextResponse.json(
          { error: "Message must be a string" },
          { status: 400 }
        );
      }
      
      if (message.trim().length === 0) {
        console.warn(`[${requestId}] Empty message provided`);
        return NextResponse.json(
          { error: "Message cannot be empty" },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return NextResponse.json(
        { error: "Invalid request body - must be valid JSON" },
        { status: 400 }
      );
    }
    
    console.log(`[${requestId}] Received message: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`);
    
    // Build system message with context
    let systemMessage = "You are VectorMind AI, a helpful, intelligent, and friendly assistant. Provide clear, concise, and accurate responses.";
    
    if (conversationHistory) {
      systemMessage += `\n\nPrevious conversation context:\n${conversationHistory}\n\nUse this context to provide more relevant and coherent responses.`;
    }
    
    // Call AI providers with automatic fallback
    console.log(`[${requestId}] Attempting multi-provider AI completion...`);
    const apiStartTime = Date.now();
    
    let aiResponse;
    try {
      aiResponse = await getChatCompletion(message, systemMessage, preferredProvider);
      
      const apiDuration = Date.now() - apiStartTime;
      console.log(`[${requestId}] ✅ ${aiResponse.provider.toUpperCase()} responded in ${apiDuration}ms`);
      
      if (aiResponse.tokensUsed) {
        console.log(`[${requestId}] Tokens used: ${aiResponse.tokensUsed}`);
      }
    } catch (aiError: any) {
      const apiDuration = Date.now() - apiStartTime;
      console.error(`[${requestId}] All AI providers failed after ${apiDuration}ms`);
      console.error(`[${requestId}] Error: ${aiError.message}`);
      
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please check your API keys and try again." },
        { status: 503 }
      );
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`[${requestId}] Response: "${aiResponse.response.substring(0, 50)}${aiResponse.response.length > 50 ? "..." : ""}"`);
    console.log(`[${requestId}] === Request completed in ${totalDuration}ms using ${aiResponse.provider} ===`);
    
    return NextResponse.json({ 
      response: aiResponse.response,
      provider: aiResponse.provider 
    });
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] === UNHANDLED ERROR (after ${totalDuration}ms) ===`);
    console.error(`[${requestId}] Error type: ${error?.constructor?.name || "Unknown"}`);
    console.error(`[${requestId}] Error message: ${error?.message || "No message provided"}`);
    console.error(`[${requestId}] Stack trace:`, error?.stack);
    
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while processing your request. Please try again later.",
        requestId: requestId
      }, 
      { status: 500 }
    );
  }
}