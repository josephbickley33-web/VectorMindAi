# Supabase Setup Guide - Turn Off Local Mode

## Quick Setup (3 Steps)

### Step 1: Run Database Schema
1. Go to your Supabase Dashboard: https://hdyugxkhnteyzutkqxes.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire content from `supabase-schema.sql`
5. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 2: Verify Tables Created
After running the schema, verify in **Table Editor**:
- ✅ conversations
- ✅ messages
- ✅ plans
- ✅ user_plans

### Step 3: Add Initial Plans (Optional)
Run this to add default subscription plans:

```sql
-- Insert default plans
INSERT INTO plans (name, price, currency, interval, tier, features, max_messages, max_context_tokens, ai_providers)
VALUES
  ('Free Plan', 0, 'USD', 'monthly', 'free', 
   '["100 messages/month", "Basic AI", "Standard support"]'::jsonb, 
   100, 4000, '["groq"]'::jsonb),
  
  ('Pro Plan', 9.99, 'USD', 'monthly', 'pro',
   '["1000 messages/month", "All AI providers", "Priority support", "Advanced features"]'::jsonb,
   1000, 16000, '["groq", "gemini", "openai"]'::jsonb),
  
  ('Enterprise', 29.99, 'USD', 'monthly', 'enterprise',
   '["Unlimited messages", "All AI providers", "24/7 support", "Custom integrations", "API access"]'::jsonb,
   -1, 32000, '["groq", "gemini", "openai"]'::jsonb);
```

## Verification

After setup, test the app:
1. Log in at `/console`
2. Send a message
3. Check Supabase Dashboard → **Table Editor** → **messages** table
4. You should see your message saved in the cloud

## What Changes

**Before (Local Mode):**
- Messages saved in browser localStorage only
- Data lost when clearing browser cache
- Conversations don't sync across devices

**After (Supabase Mode):**
- Messages saved to Supabase cloud database
- Data persists permanently
- Access from any device
- Full conversation history
- User authentication integrated

## Troubleshooting

### Tables Not Created
- Make sure you're in the correct project: hdyugxkhnteyzutkqxes
- Check for SQL errors in the output panel
- Verify you have owner/admin permissions

### Messages Still Using localStorage
- Clear browser cache and localStorage
- Hard refresh (Ctrl+Shift+R)
- Check browser console for Supabase errors
- Verify environment variables are set

### RLS (Row Level Security) Errors
The schema includes RLS policies that ensure:
- Users can only see their own conversations
- Users can only create/update their own data
- Messages are linked to conversations owned by the user

If you get RLS errors, temporarily disable RLS in Supabase:
```sql
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

## Environment Variables

Your current Supabase config (already set in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://hdyugxkhnteyzutkqxes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Next Steps

1. **Run the schema** in Supabase SQL Editor
2. **Test login** and send a message
3. **Check database** to confirm it's saved
4. (Optional) Configure email templates in Supabase Auth settings
5. (Optional) Set up database backups
6. (Optional) Add analytics tracking

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Check console logs with F12
- Review RLS policies if access denied errors occur
