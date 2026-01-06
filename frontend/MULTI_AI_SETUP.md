# 🎉 Multi-AI Provider Setup Guide

Your VectorMind AI now supports **3 AI providers** with automatic fallback!

**Priority Order:** Groq (fastest & free) → Gemini (free) → OpenAI (fallback)

---

## 🚀 Quick Setup

### Option 1: Groq Only (Recommended - FREE & FAST!)

1. Go to: https://console.groq.com/keys
2. Sign up (free account)
3. Click **"Create API Key"**
4. Copy the key
5. Add to `.env.local`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

**Done!** Your app will now use Groq (free, unlimited, super fast)

---

### Option 2: Gemini Only (Also FREE!)

1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Get API key"** or **"Create API key"**
3. Copy the key
4. Add to `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSy_your_key_here
   ```

**Done!** Your app will use Google Gemini (free tier)

---

### Option 3: All Three (Maximum Reliability)

Get keys from all providers for automatic fallback:

1. **Groq** (FREE - unlimited):
   - https://console.groq.com/keys
   - Add: `GROQ_API_KEY=gsk_...`

2. **Gemini** (FREE - 60 requests/minute):
   - https://aistudio.google.com/app/apikey
   - Add: `GEMINI_API_KEY=AIzaSy_...`

3. **OpenAI** (Paid - you already have this):
   - Your existing `OPENAI_API_KEY` works as fallback

---

## ✅ Testing

### Start the Server

```bash
cd /workspaces/VectorMindAi/frontend
npm run dev
```

### Test in Browser

1. Open http://localhost:3000
2. Go to Console
3. Send a message
4. Check server logs - you'll see which provider responded:
   ```
   ✅ GROQ responded in 234ms
   ```

### Test via Terminal

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Which AI are you?"}'
```

Response will include the provider used:
```json
{
  "response": "I'm VectorMind AI...",
  "provider": "groq"
}
```

---

## 🎯 How It Works

The system **automatically tries providers in order**:

1. **Groq First** (if API key is set)
   - ✅ FREE
   - ✅ Unlimited requests
   - ✅ Super fast (< 500ms)
   - ✅ Uses Llama 3.3 70B

2. **Gemini Next** (if Groq fails/not set)
   - ✅ FREE tier
   - ✅ 60 requests/minute
   - ✅ Good quality
   - ✅ Uses Gemini 1.5 Flash

3. **OpenAI Last** (if both fail/not set)
   - ⚠️ Paid
   - ⚠️ Rate limits
   - ✅ High quality
   - ✅ Uses GPT-4o-mini

**No code changes needed** - just add the API keys!

---

## 💰 Cost Comparison

| Provider | Cost | Rate Limit | Speed |
|----------|------|------------|-------|
| **Groq** | FREE | Unlimited | ⚡ Super Fast |
| **Gemini** | FREE | 60/min | 🚀 Fast |
| **OpenAI** | $0.15/1M tokens | Varies | 🐢 Moderate |

**Recommendation:** Use Groq for 99% of requests (it's free and fastest!)

---

## 🔧 Configuration

Your `.env.local` should look like:

```dotenv
# Groq (FREE - get this first!)
GROQ_API_KEY=gsk_your_actual_key_here

# Gemini (FREE - get this second!)
GEMINI_API_KEY=AIzaSy_your_actual_key_here

# OpenAI (keep as fallback)
OPENAI_API_KEY=sk-proj-your_actual_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🐛 Troubleshooting

### "All AI providers are unavailable"
- Check that at least one API key is valid
- Verify keys are correct (no typos)
- Check console logs to see which providers failed

### Groq not responding
- Verify key starts with `gsk_`
- Check https://console.groq.com/keys
- Make sure account is active

### Gemini not responding
- Verify key starts with `AIzaSy`
- Enable the Gemini API in Google Cloud Console
- Check quota limits

### Still using OpenAI despite having Groq/Gemini
- Restart the dev server after adding keys
- Check logs - it shows which provider is used
- Verify keys aren't set to placeholder values

---

## 📊 Server Logs

You'll see detailed logs like:

```
🤖 Trying AI providers in order: Groq -> Gemini -> OpenAI
✅ Groq succeeded
[abc-123] ✅ GROQ responded in 234ms
[abc-123] Tokens used: 45
```

This helps you track which provider is being used!

---

## 🎉 Benefits

✅ **No more rate limit errors** - Free providers with high limits
✅ **Faster responses** - Groq is 5-10x faster than OpenAI
✅ **Cost savings** - Free instead of paid API calls
✅ **Automatic fallback** - If one fails, tries the next
✅ **Zero downtime** - Always have a working AI

---

## 🚀 Get Started Now

1. Get a Groq API key: https://console.groq.com/keys
2. Add to `.env.local`: `GROQ_API_KEY=gsk_...`
3. Restart server: `npm run dev`
4. Test it: Send a message in the Console
5. 🎉 Enjoy free, fast AI responses!

Questions? Check the server logs to see what's happening!
