# 🚀 VectorMind AI - Quick Setup Guide

## ✅ Your App is Now Working!

The console will work even without Supabase tables (messages just won't be saved permanently).

## 🔧 To Enable Full Features (Message Persistence)

### 1. Set Up Supabase Tables

Go to your Supabase dashboard:
https://supabase.com/dashboard/project/hdyugxkhnteyzutkqxes

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** or press Cmd/Ctrl + Enter

This will create:
- ✅ `conversations` table
- ✅ `messages` table  
- ✅ `plans` table
- ✅ `user_plans` table
- ✅ Row Level Security policies
- ✅ Default subscription plans

## 📱 How to Use the App

### Option 1: Simple Chat (No Login)
Visit: `/simple-chat`
- No login required
- Chat directly with AI
- Messages not saved
- Great for testing

### Option 2: Full Console (With Login)
Visit: `/console`
1. You'll be redirected to `/login`
2. Sign up with email + password
3. Chat with AI
4. If Supabase tables exist: Messages are saved
5. If not: Still works, just in "local mode"

### Option 3: Landing Page Chat
Visit: `/` (home page)
- Scroll to "Try it Now" section
- Chat demo with AI
- No login needed

## 🎨 Available Pages

- `/` - Beautiful landing page
- `/login` - Authentication
- `/console` - Full AI chat console (requires login)
- `/simple-chat` - Quick chat (no login)
- `/portal` - Subscription management
- `/settings` - User settings
- `/test-input` - Input diagnostic page

## 🔑 Current Status

**Backend:** ✅ Running on port 8000
**Frontend:** ✅ Running on port 3000
**API Keys:** ✅ Configured (Groq, Gemini, OpenAI)
**Supabase:** ✅ Connected (tables need setup)

## 💡 Next Steps

1. **Run the SQL script** to enable message persistence
2. **Test the `/console`** - should work perfectly now
3. **Customize** your plans in the Supabase dashboard
4. **Deploy** to Vercel when ready!

## 🐛 Troubleshooting

**If console still shows "Setting up conversation":**
- Check browser console (F12) for error messages
- Try `/simple-chat` instead
- Refresh the page
- Run the SQL schema in Supabase

**If you see "Local mode active":**
- Supabase tables haven't been created yet
- Run `supabase-schema.sql` in Supabase SQL Editor
- You can still chat, messages just won't save

## 🎉 You're All Set!

Your VectorMind AI platform is fully functional with fallbacks in place!
