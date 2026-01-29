# API Keys Setup Guide

This guide will help you obtain all the necessary API keys to run the Course Generation Platform.

## 🔴 REQUIRED API Keys

### 1. OpenRouter API Key (ESSENTIAL for Course Generation)

OpenRouter provides access to multiple AI models including Mistral, GPT-4, Claude, and more.

#### Step-by-Step Guide:

**Step 1: Create Account**
1. Visit https://openrouter.ai/
2. Click "Sign Up" button (top right)
3. Sign up using:
   - Google account (recommended)
   - GitHub account
   - Or email/password

**Step 2: Add Credits**
1. After logging in, go to https://openrouter.ai/credits
2. Click "Add Credits"
3. Recommended starting amount: **$5-10**
4. Payment methods: Credit card, crypto
5. You'll receive a confirmation email

**Step 3: Generate API Key**
1. Navigate to https://openrouter.ai/keys
2. Click "Create Key" button
3. Enter a name: `Unfold Course Generator`
4. (Optional) Set rate limits to control spending
5. Click "Create"
6. **IMPORTANT**: Copy the key immediately (it won't be shown again)
   - Format: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Step 4: Add to Your Project**
1. Open `.env.local` in your project root
2. Add the line:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```
3. Save the file
4. Restart your development server

#### Cost Information:
- **Mistral 7B**: ~$0.001 per course generation
- **GPT-4**: ~$0.10 per course generation
- **Claude 3**: ~$0.05 per course generation

**Tip**: Start with Mistral (cheapest) and upgrade to better models if needed.

#### Monitoring Usage:
- Check usage: https://openrouter.ai/activity
- View spend: https://openrouter.ai/credits
- Set alerts to avoid overspending

---

## 🟡 OPTIONAL API Keys (Recommended for Full Features)

### 2. Google OAuth (for User Authentication)

If you want users to sign in with Google:

#### Step-by-Step Guide:

**Step 1: Go to Google Cloud Console**
1. Visit https://console.cloud.google.com/
2. Sign in with your Google account

**Step 2: Create a New Project**
1. Click on the project dropdown (top left)
2. Click "New Project"
3. Name it: `Unfold Course Platform`
4. Click "Create"

**Step 3: Enable APIs**
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

**Step 4: Create OAuth Credentials**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the consent screen:
   - User Type: External
   - App name: Unfold Course Platform
   - Support email: Your email
   - Authorized domains: localhost
4. Application type: "Web application"
5. Name: `Unfold Web Client`
6. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001` (if using different port)
7. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
8. Click "Create"

**Step 5: Copy Credentials**
You'll see:
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxx`

**Step 6: Add to .env.local**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

---

### 3. PostgreSQL Database (for Production)

For local development, you can use Docker (included in `docker-compose.yml`).

#### Option A: Use Docker (Easiest)

1. Make sure Docker is installed
2. Run:
   ```bash
   docker-compose up -d db
   ```
3. Connection string is already configured in `.env.local`

#### Option B: Cloud Database (Recommended for Production)

**Using Railway** (Free tier available):

1. Visit https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Provision PostgreSQL"
5. Once created, click on the database
6. Go to "Connect" tab
7. Copy the "Postgres Connection URL"
8. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

**Using Supabase** (Free tier available):

1. Visit https://supabase.com/
2. Sign up with GitHub
3. Create a new project
4. Go to Project Settings > Database
5. Copy the "Connection string" (URI mode)
6. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
   ```

---

## 📋 Complete .env.local Template

Create a file named `.env.local` in your project root with this content:

```env
# ============================================
# REQUIRED - Course Generation
# ============================================
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# ============================================
# Backend API Configuration
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# ============================================
# NextAuth Configuration (Optional)
# ============================================
NEXTAUTH_SECRET=your-random-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=another-random-secret-here

# ============================================
# Google OAuth (Optional)
# ============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# ============================================
# Database (Optional)
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/unfold

# ============================================
# Additional Services (Future Use)
# ============================================
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
# STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep API keys secret
- Add `.env.local` to `.gitignore`
- Use environment variables, never hardcode keys
- Rotate keys periodically
- Set spending limits on APIs
- Use different keys for dev/production

### ❌ DON'T:
- Commit `.env.local` to Git
- Share keys publicly
- Use production keys in development
- Hardcode keys in source code
- Use the same key across multiple projects

---

## 🧪 Testing Your Setup

After adding the OpenRouter API key, test it:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/home

3. Enter a topic: "Python Programming"

4. Complete the questionnaire

5. Click "Next" to generate

6. You should see a course curriculum

**If it works**: ✅ Your API key is configured correctly!

**If it fails**: Check:
- Is the key in `.env.local`?
- Did you restart the dev server?
- Does the key start with `sk-or-v1-`?
- Do you have credits in your OpenRouter account?

---

## 💰 Cost Management

### OpenRouter Budget Tips:
1. **Set a monthly limit** in OpenRouter settings
2. **Start with Mistral** (cheapest model)
3. **Monitor usage** regularly
4. **Use caching** to avoid regenerating same content

### Approximate Costs:
| Action | Mistral 7B | GPT-4 | Claude 3 |
|--------|-----------|-------|----------|
| Generate course | $0.001 | $0.10 | $0.05 |
| 100 courses | $0.10 | $10.00 | $5.00 |
| 1000 courses | $1.00 | $100.00 | $50.00 |

---

## 🆘 Troubleshooting

### "OPENROUTER_API_KEY is not defined"
- Check `.env.local` exists in project root
- Verify no typos in variable name
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Insufficient credits"
- Add more credits at https://openrouter.ai/credits
- Minimum: $5

### "Invalid API key"
- Regenerate key at https://openrouter.ai/keys
- Make sure you copied the complete key
- Check for extra spaces before/after the key

### "Rate limit exceeded"
- You're making too many requests
- Wait a few minutes
- Upgrade your plan on OpenRouter

---

## 📞 Support

- **OpenRouter Support**: https://openrouter.ai/docs/
- **Google Cloud Support**: https://cloud.google.com/support
- **Railway Support**: https://railway.app/help
- **Supabase Support**: https://supabase.com/support

---

## ✅ Setup Checklist

- [ ] Created OpenRouter account
- [ ] Added credits to OpenRouter
- [ ] Generated OpenRouter API key
- [ ] Created `.env.local` file
- [ ] Added `OPENROUTER_API_KEY` to `.env.local`
- [ ] Restarted development server
- [ ] Tested course generation
- [ ] (Optional) Set up Google OAuth
- [ ] (Optional) Set up database
- [ ] Added `.env.local` to `.gitignore`

---

**You're all set! 🎉**

Start the server with `npm run dev` and create your first AI-generated course!
