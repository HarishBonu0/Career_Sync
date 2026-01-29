# Course Generation Module - Setup & Troubleshooting

## Current Setup
- **Port**: 3000
- **Framework**: Next.js 14
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **API**: Gemini API for course generation

## Required Environment Variables
Your `.env` file already has:
```
NEXT_PUBLIC_SUPABASE_URL=https://ynyjhfldcjwsgfmhrbqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL="postgresql://postgres:Harish@123Supabase@..."
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAnfq4O_20uxzj2MFA1myLCAHWewf-sfMQ
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

## How to Fix Common Issues

### Issue 1: Module Won't Start
**Solution:**
```bash
cd "course generation"
npm install
npm run dev
```

### Issue 2: Supabase Connection Error
**Check if database URL is correct:**
- URL: `postgresql://postgres:Harish@123Supabase@db.ynyjhfldcjwsgfmhrbqy.supabase.co:5432/postgres`
- This requires the Supabase schema to be set up first

### Issue 3: Prisma Schema Mismatch
**Solution - Skip Prisma for now, use Supabase directly:**
The module uses direct Supabase client in `lib/supabase.ts`

## Features
1. **Home Page** - Dashboard with course browsing
2. **Course Generation** - Generate courses using Gemini API
3. **Learning Journeys** - Track progress on courses
4. **Authentication** - Login with email/password via NextAuth

## Default Test Users
You can use these credentials (from lib/auth.ts):
- Email: `learner@example.com` | Password: `password123`
- Email: `educator@example.com` | Password: `password123`
- Email: `admin@example.com` | Password: `password123`

## Next Steps
1. Start the module on port 3000
2. Open http://localhost:3000
3. Login with test credentials
4. Browse the home page and test course generation
5. Navigation should flow back to landing page (port 4173)
