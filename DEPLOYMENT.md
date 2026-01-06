# Deployment Guide

## ✅ Completed Features

### 1. Advanced AI Features
- ✅ Multi-provider selection (Groq, Gemini, OpenAI)
- ✅ Prompt library with 5 templates
- ✅ File upload (text/PDF/images)
- ✅ Voice recognition with auto-stop
- ✅ Text-to-speech
- ✅ Message actions (copy/speak/regenerate/edit)
- ✅ Conversation sharing
- ✅ Demo mode (no auth required)

### 2. Stripe Integration
- ✅ Pricing page with 3 tiers (Free/Pro/Enterprise)
- ✅ Checkout flow
- ✅ Subscription management page
- ✅ Webhook handler for subscription events
- ✅ Usage tracking UI

### 3. AI Comparison
- ✅ Side-by-side provider comparison
- ✅ Speed/cost/quality metrics
- ✅ Real-time performance stats
- ✅ Visual comparison UI

## 🚀 Deploy to Vercel

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `josephbickley33-web/VectorMindAi`
4. Select the repository and click "Import"

### Step 2: Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

Required variables:

```bash
# AI Provider Keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (for authentication & data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Site URL
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

## 🔑 Get API Keys

### Groq (Free Tier)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Go to API Keys
4. Create new key

### Gemini (Free Tier)
1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"

### OpenAI (Paid)
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up / Log in
3. Create new secret key

### Supabase (Free Tier)
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy URL and keys
5. Run the SQL schema from `supabase-schema.sql`

### Stripe
1. Visit [dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up / Log in
3. Go to Developers → API keys
4. Copy secret key
5. Create products & prices for your tiers
6. Update `priceId` in `/app/pricing/page.tsx` with your actual price IDs

## 📋 Post-Deployment Setup

### 1. Configure Stripe Webhook
1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to environment variables

### 2. Create Stripe Products
1. Go to Products in Stripe Dashboard
2. Create:
   - **Pro Plan**: $19/month recurring
   - **Enterprise Plan**: $99/month recurring
3. Copy the Price IDs
4. Update in `frontend/app/pricing/page.tsx`:
   ```tsx
   priceId: "price_xxxxxxxxxxxxx" // Your actual Stripe price ID
   ```

### 3. Test the Application
- Visit `/console-pro` - Test AI chat with all providers
- Visit `/comparison` - Test side-by-side AI comparison
- Visit `/pricing` - Test Stripe checkout (use test mode)
- Test voice input, file upload, TTS

## 🎯 Features by Plan

### Free Tier
- 50 AI requests/month
- Groq & Gemini only
- Basic chat interface
- 7-day history

### Pro Tier ($19/month)
- Unlimited requests
- All providers (including OpenAI)
- Advanced features (voice, files, TTS)
- AI comparison
- Unlimited history
- Export & sharing

### Enterprise ($99/month)
- Everything in Pro
- Team collaboration (10 users)
- API access
- Custom training
- Dedicated support
- SLA guarantee

## 📊 Next Steps

1. **Custom Domain**: Add in Vercel dashboard → Settings → Domains
2. **Analytics**: Add Vercel Analytics or Google Analytics
3. **Error Tracking**: Add Sentry for production error monitoring
4. **Email**: Configure SendGrid/Resend for transactional emails
5. **Database**: Implement Supabase schema for user subscriptions
6. **Rate Limiting**: Add API rate limiting based on tier
7. **Usage Tracking**: Track token usage per user

## 🔧 Local Development

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 🎉 Launch Checklist

- [ ] All API keys configured
- [ ] Stripe products created
- [ ] Stripe webhook configured
- [ ] Test checkout flow (Stripe test mode)
- [ ] Test all AI providers
- [ ] Test voice/file/TTS features
- [ ] Test comparison feature
- [ ] Verify mobile responsiveness
- [ ] Set up error monitoring
- [ ] Add legal pages (Terms, Privacy)
- [ ] Launch! 🚀

---

**Repository**: https://github.com/josephbickley33-web/VectorMindAi
**Live URL**: (Add after deployment)
