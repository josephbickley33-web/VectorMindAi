# Supabase Setup Guide

## 🔐 Getting Your Supabase Credentials

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Your project name (e.g., "VectorMind AI")
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you (e.g., us-east-1)
4. Click **"Create new project"** and wait for it to finish

### Step 2: Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon (public) Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The URL looks like: `https://your-project-id.supabase.co`

### Step 3: Update Your `.env.local`

```bash
cd /workspaces/VectorMindAi/frontend
```

Edit `.env.local` and replace:
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

With your actual values from Step 2.

### Step 4: Verify Configuration

```bash
# Check if both variables are set
cat .env.local | grep -E "SUPABASE|OPENAI"
```

You should see:
```
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## ⚠️ Important Notes

- **Public Keys**: `NEXT_PUBLIC_*` keys are visible in the browser (intentional)
- **Security**: Never commit `.env.local` to git (it's in `.gitignore`)
- **Key Rotation**: Rotate keys regularly in Supabase dashboard
- **RLS Policies**: Set up Row Level Security (RLS) for database tables

## 🧪 Test Configuration

Once configured, the app should start without errors:

```bash
npm run dev
```

If you still see the Supabase error, verify:
1. Both environment variables are set correctly
2. No extra spaces or quotes in `.env.local`
3. Restart the dev server after updating `.env.local`

## 🔍 Troubleshooting

### "Missing Supabase environment variables" Error
- Check `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify there are no typos in variable names
- Make sure values are not wrapped in quotes

### "Invalid credentials" or "Could not connect"
- Verify the URL format: `https://your-id.supabase.co`
- Check the API key is correct (copy from dashboard again)
- Check your Supabase project is active (not paused)

### Values not being read
- Restart the dev server: Press `Ctrl+C` then `npm run dev`
- Next.js only reads env vars at build/startup time

## 📚 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase API Reference](https://supabase.com/docs/reference/javascript)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)
