# VectorMind AI Setup & Testing Guide

## 🔑 Environment Setup

### 1. Get Your OpenAI API Key
- Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
- Click **"Create new secret key"**
- Copy the key immediately (you won't be able to see it again)

### 2. Configure Your Environment
Create a `.env.local` file in the `frontend` directory:

```bash
cd frontend
echo "OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE" > .env.local
```

**Replace `YOUR_ACTUAL_KEY_HERE` with your OpenAI key**

### 3. Verify Setup
Check that your environment is configured:
```bash
cat .env.local | grep OPENAI
# Should show: OPENAI_API_KEY=sk-proj-...
```

---

## 🧪 Testing the API

### Option 1: Run the Test Script (Recommended)

```bash
cd frontend

# Install dependencies if needed
npm install

# Run the test script
node test-api.js
```

**Expected output:**
```
🚀 Starting VectorMind AI API Test

📍 API URL: http://localhost:3000
📝 Test Message: "Hello, what is your name?"

🔍 Environment Check:
✅ OPENAI_API_KEY is set
   Prefix: sk-proj-...

📤 Sending request to /api/chat...
⏱️  Response time: 1234ms

✅ Success!

🤖 AI Response:
──────────────────────────────────────────────────
I'm VectorMind AI, a helpful assistant. How can I assist you today?
──────────────────────────────────────────────────

✨ API is working correctly!
```

**First, start the development server in another terminal:**
```bash
npm run dev
```

### Option 2: Use cURL

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, what is your name?"}'
```

### Option 3: Test in the Browser

1. Start the dev server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Navigate to the console page
4. Send a message through the chat interface

---

## 🔍 Configuration Checklist

- [ ] API Key obtained from OpenAI
- [ ] `.env.local` file created with valid key
- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] `node_modules` installed (`npm install`)
- [ ] Port 3000 is available (or configure `dev` script)
- [ ] No firewall blocking localhost connections

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY is not set"
```bash
# Check your .env.local file
cat .env.local

# Make sure the format is: OPENAI_API_KEY=sk-proj-...
```

### "API key is invalid or expired"
- Your API key may be wrong or revoked
- Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
- Create a new key and update `.env.local`

### "Could not connect to the API server"
- Make sure Next.js dev server is running: `npm run dev`
- Check that port 3000 is not in use: `lsof -i :3000`
- Try a different port: `npm run dev -- -p 3001`

### "Rate limit exceeded"
- You've made too many API calls in a short time
- OpenAI has different rate limits based on your plan
- Wait a moment and try again

### "OpenAI service is temporarily unavailable"
- OpenAI's servers might be down
- Check [OpenAI Status](https://status.openai.com)
- Try again in a few moments

### Detailed Logs
The API now includes request IDs and detailed logging. Check the console output:
```
[UUID-HERE] === Chat API Request Started ===
[UUID-HERE] Received message: "..."
[UUID-HERE] OpenAI API response received in 1234ms
[UUID-HERE] === Request completed in 1500ms ===
```

---

## 📊 API Improvements Made

1. **Better Error Handling**
   - Validates request body (required, type, non-empty)
   - Validates API key format
   - Specific error messages for different OpenAI errors
   - Request IDs for debugging

2. **Enhanced Logging**
   - Request tracking with unique IDs
   - Performance metrics (response times)
   - Error context and stack traces
   - Message truncation to prevent log spam

3. **Security**
   - Generic error messages to clients
   - Secure API key validation
   - No sensitive data in responses

4. **Configuration**
   - `.env.example` template provided
   - Environment variables properly isolated
   - `.gitignore` updated to prevent accidental commits

---

## 🚀 Next Steps

1. Set up your API key in `.env.local`
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Run `node test-api.js` to verify everything works
5. Open [http://localhost:3000](http://localhost:3000) and test the chat interface

Good luck! 🎉
