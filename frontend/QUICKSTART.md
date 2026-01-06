# ⚡ Quick Start Guide

Get your VectorMind AI app running in 5 minutes.

---

## Step 1: Get Free API Keys (2 minutes)

### Groq (Recommended - FREE & UNLIMITED)
1. Go to https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key (starts with `gsk_`)

### Google Gemini (Optional - FREE)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy_`)

### Supabase (Database - FREE)
1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose any name and region
4. Wait for it to start
5. Go to Settings → API → Copy `Project URL`
6. Copy `anon public` key

---

## Step 2: Configure Environment (1 minute)

Create `.env.local` in the `frontend` folder:

```bash
# AI Keys
GROQ_API_KEY=gsk_your_key_here
GEMINI_API_KEY=AIzaSy_your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Save the file!**

---

## Step 3: Set Up Database (1 minute)

In Supabase dashboard:

1. Go to SQL Editor
2. Click "New Query"
3. Paste this:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_provider TEXT,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for privacy
CREATE POLICY "Users can see their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  USING (auth.uid()::text = user_id);

-- Message policies
CREATE POLICY "Users can see messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND user_id = auth.uid()::text
    )
  );
```

4. Click "Run"
5. Done! Tables are created.

---

## Step 4: Start Development (1 minute)

```bash
cd /workspaces/VectorMindAi/frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000 in your browser.

**You're live!** 🎉

---

## Step 5: Test It

1. Click "Console" (top left)
2. Type a message
3. Watch the AI respond
4. See the response in your database!

---

## 🚀 Deploy to Vercel (Optional)

When ready to go live:

1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com
3. Click "New Project" → Select your repo
4. Add the same environment variables
5. Click "Deploy"

Your app is live! 🌍

---

## ❌ Troubleshooting

**App won't start?**
```bash
npm run dev --verbose
```

**API key error?**
- Check `.env.local` exists
- Check key values are copied correctly
- Restart dev server after editing `.env.local`

**Database error?**
- Verify Supabase keys in `.env.local`
- Check if tables were created (look in Supabase dashboard)
- Ensure RLS policies are enabled

**No AI response?**
- Make sure you have at least one API key (Groq recommended)
- Check browser console for errors (F12)
- Look at server logs for details

---

**Need help?** Check [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) for full documentation.
