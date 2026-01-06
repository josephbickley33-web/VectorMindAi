#!/usr/bin/env node

/**
 * Test script for VectorMind AI API
 * Tests the chat endpoint with a simple message
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env.local") });

const API_URL = process.env.API_URL || "http://localhost:3000";
const TEST_MESSAGE = "Hello, what is your name?";

async function testAPI() {
  console.log("🚀 Starting VectorMind AI API Test\n");
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`📝 Test Message: "${TEST_MESSAGE}"\n`);

  // Check environment
  console.log("🔍 Environment Check:");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ ERROR: OPENAI_API_KEY not found in .env.local");
    process.exit(1);
  }
  console.log("✅ OPENAI_API_KEY is set");
  console.log(`   Prefix: ${apiKey.substring(0, 12)}...`);
  console.log();

  try {
    console.log("📤 Sending request to /api/chat...");
    const startTime = Date.now();

    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: TEST_MESSAGE }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`⏱️  Response time: ${elapsed}ms\n`);

    // Handle different status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error (${response.status}):`);
      console.error(`   ${errorData.error || response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();

    if (data.error) {
      console.error("❌ API returned error:");
      console.error(`   ${data.error}`);
      process.exit(1);
    }

    console.log("✅ Success!\n");
    console.log("🤖 AI Response:");
    console.log("─".repeat(50));
    console.log(data.response);
    console.log("─".repeat(50));
    console.log();
    console.log("✨ API is working correctly!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection Error:");
    if (error.code === "ECONNREFUSED") {
      console.error("   Could not connect to the API server.");
      console.error(`   Make sure the development server is running at ${API_URL}`);
      console.error("   Run: npm run dev");
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testAPI();
