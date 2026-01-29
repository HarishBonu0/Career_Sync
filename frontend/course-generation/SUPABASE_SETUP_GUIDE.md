# Supabase Setup & Integration Guide

## ✅ Is Supabase Right for Your Project?

**YES! Supabase is PERFECT for your project.** Here's why:

### Benefits for Your Course Generation Platform:

| Feature | Supabase | Your Needs | Rating |
|---------|----------|-----------|--------|
| PostgreSQL Database | ✅ Full PostgreSQL | Complex relational data | ⭐⭐⭐⭐⭐ |
| Real-time Features | ✅ WebSockets | Live progress tracking | ⭐⭐⭐⭐⭐ |
| Authentication | ✅ Built-in Auth | Google OAuth, JWT | ⭐⭐⭐⭐⭐ |
| Storage (Videos) | ✅ S3-compatible | Video files & assets | ⭐⭐⭐⭐⭐ |
| Row Level Security | ✅ RLS Policies | User data protection | ⭐⭐⭐⭐⭐ |
| REST API | ✅ Auto-generated | Course/lesson APIs | ⭐⭐⭐⭐⭐ |
| Scalability | ✅ Excellent | Growing user base | ⭐⭐⭐⭐⭐ |
| Cost | ✅ Free tier + pay-as-you-go | Budget-friendly | ⭐⭐⭐⭐⭐ |
| Backups | ✅ Automatic | Data safety | ⭐⭐⭐⭐⭐ |

### Why Supabase for Your Multi-Module Project:

1. **Users & Authentication**
   - Handle learners, educators, admins
   - Social login (Google OAuth)
   - Role-based access control

2. **Courses & Content**
   - Store all courses, topics, modules
   - Save generated curriculum
   - Manage course metadata

3. **Progress Tracking**
   - User progress per course
   - Topic completion status
   - Time spent on lessons
   - Quiz/assessment results

4. **Video Storage**
   - Built-in S3-compatible storage
   - Store lesson videos
   - Handle thumbnails

5. **Learning Journeys**
   - Complex relationships between journeys and courses
   - Enrollment tracking
   - Prerequisites management

6. **Real-time Features**
   - Live notification updates
   - Real-time progress sync
   - Instant enrollment confirmation

**Conclusion**: Supabase is **enterprise-grade** and perfect for your complex, multi-module project.

---

## 📋 Step-by-Step: Create Supabase Account & Get Database URL

### Step 1: Sign Up for Supabase

1. **Go to Supabase**
   - Visit: https://supabase.com/
   - Click "Start your project" or "Sign Up"

2. **Choose Sign-Up Method**
   - GitHub (Recommended - fastest)
   - Email
   - Click your preferred option

3. **GitHub OAuth (If using GitHub)**
   - Click "Continue with GitHub"
   - Authorize Supabase
   - Confirm email if needed

4. **Complete Profile**
   - Name
   - Company (optional)
   - Agree to terms
   - Click "Create account"

### Step 2: Create Your First Project

1. **After Sign In, You'll See Dashboard**
   - Click "New project" or "Create new project"

2. **Configure Project**
   - **Project Name**: `unfold-course-platform`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select closest to your users
     - `us-east-1` for US
     - `eu-west-1` for Europe
     - `ap-southeast-1` for Asia
   - **Pricing Plan**: Select "Free" (perfect for development)

3. **Click "Create new project"**
   - Wait 1-2 minutes for initialization
   - You'll get a notification when ready

### Step 3: Get Your Database Connection String

1. **Go to Project Settings**
   - Click project name (top left)
   - Select "Settings"

2. **Navigate to Database**
   - Left sidebar → "Database"
   - You'll see connection details

3. **Copy Connection String**
   - Look for "Connection string"
   - Select "URI" tab
   - Copy the string (starts with `postgresql://`)
   - Format:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
   ```

4. **Add to .env.local**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
   ```

### Step 4: Verify Connection (Optional)

1. **Test Connection**
   - Right-click on your project
   - Select "Copy connection string"
   - Test with: `psql [CONNECTION_STRING]`

---

## 🚀 Integrate Supabase with Your Project

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js prisma @prisma/client
```

### Step 2: Set Up Prisma ORM

**Why Prisma?**
- Type-safe database queries
- Auto-generated API
- Works perfectly with Supabase
- Better than raw SQL

1. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

2. **Update .env.local**
   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
   ```

### Step 3: Create Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Users
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password_hash String?
  role          String    @default("learner") // learner, educator, admin
  avatar_url    String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  courses       Course[]
  enrollments   Enrollment[]
  progress      UserProgress[]
  journeys      LearningJourney[]
}

// Courses
model Course {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String
  topic         String
  duration      String?
  difficulty    String?
  thumbnail_url String?
  
  creator_id    String
  creator       User      @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  
  journey_id    String?
  journey       LearningJourney? @relation(fields: [journey_id], references: [id], onDelete: SetNull)
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  topics        Topic[]
  enrollments   Enrollment[]
  progress      UserProgress[]

  @@index([creator_id])
  @@index([journey_id])
  @@index([slug])
}

// Topics/Lessons
model Topic {
  id            String    @id @default(cuid())
  title         String
  description   String
  content       String
  video_url     String?
  duration      Int       // in seconds
  order         Int       // sequence in course
  
  course_id     String
  course        Course    @relation(fields: [course_id], references: [id], onDelete: Cascade)
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  progress      UserProgress[]

  @@index([course_id])
  @@unique([course_id, order])
}

// Learning Journeys
model LearningJourney {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String
  who_is_for    String?
  who_is_not_for String?
  thumbnail_url String?
  
  creator_id    String
  creator       User      @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  courses       Course[]
  enrollments   Enrollment[]

  @@index([creator_id])
  @@index([slug])
}

// Enrollments (Courses & Journeys)
model Enrollment {
  id            String    @id @default(cuid())
  user_id       String
  user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  course_id     String?
  course        Course?   @relation(fields: [course_id], references: [id], onDelete: Cascade)
  
  journey_id    String?
  journey       LearningJourney? @relation(fields: [journey_id], references: [id], onDelete: Cascade)
  
  enrolled_at   DateTime  @default(now())
  progress      Int       @default(0) // 0-100

  @@unique([user_id, course_id])
  @@unique([user_id, journey_id])
  @@index([user_id])
  @@index([course_id])
  @@index([journey_id])
}

// User Progress
model UserProgress {
  id            String    @id @default(cuid())
  user_id       String
  user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  course_id     String
  course        Course    @relation(fields: [course_id], references: [id], onDelete: Cascade)
  
  topic_id      String
  topic         Topic     @relation(fields: [topic_id], references: [id], onDelete: Cascade)
  
  completed     Boolean   @default(false)
  time_spent    Int       @default(0) // in seconds
  last_accessed DateTime  @updatedAt
  
  created_at    DateTime  @default(now())

  @@unique([user_id, topic_id])
  @@index([user_id])
  @@index([course_id])
}

// Educator Applications
model EducatorApplication {
  id            String    @id @default(cuid())
  user_id       String
  reason        String
  status        String    @default("pending") // pending, approved, rejected
  
  submitted_at  DateTime  @default(now())
  reviewed_at   DateTime?
}
```

### Step 4: Push Schema to Supabase

```bash
npx prisma migrate dev --name init
```

This will:
- Create migration file
- Run migration on Supabase
- Generate Prisma client

### Step 5: Create API Routes with Prisma

Example: `app/api/courses/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: { id: true, name: true, avatar_url: true }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const course = await prisma.course.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        topic: body.topic,
        creator_id: body.creator_id, // From user session
      }
    })

    return NextResponse.json({ success: true, course }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

### Step 6: Update Environment Variables

```env
# Supabase
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"

# OpenRouter (existing)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# NextAuth (existing)
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 🎯 What You Get with Supabase

### Database Features:
- ✅ PostgreSQL (enterprise database)
- ✅ Automatic backups (daily)
- ✅ Point-in-time recovery
- ✅ Connection pooling
- ✅ Row Level Security

### Authentication:
- ✅ Email/password
- ✅ Google OAuth (built-in)
- ✅ GitHub OAuth
- ✅ Magic links
- ✅ Multi-factor authentication

### Storage:
- ✅ S3-compatible object storage
- ✅ Perfect for videos, images
- ✅ CDN for fast delivery
- ✅ File size limits: 50GB per file

### Real-time Capabilities:
- ✅ WebSocket connections
- ✅ Live subscriptions
- ✅ Real-time notifications
- ✅ Presence tracking

### Additional Tools:
- ✅ REST API (auto-generated)
- ✅ GraphQL API
- ✅ Vector embeddings (AI search)
- ✅ Edge Functions (serverless)

---

## 💰 Supabase Pricing

### Free Tier (Perfect for Starting)
- **Database**: 500 MB
- **Auth**: Unlimited users
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **Functions**: Disabled

### Pro Tier ($25/month)
- **Database**: 8 GB
- **Storage**: 100 GB
- **Bandwidth**: 250 GB/month
- **Functions**: Enabled

### Usage Based (After free limits)
- **Database**: $1.25 per GB
- **Storage**: $0.05 per GB
- **Bandwidth**: $0.09 per GB
- **Functions**: $0.000001 per invocation

### Cost Estimate for Your Project:
**Development**: Free tier
**Production (1000 users)**:
- Database: ~$1-2/month
- Storage (videos): ~$5-10/month
- Bandwidth: ~$5-15/month
- **Total**: ~$15-30/month

---

## 🔒 Security Features

### Row Level Security (RLS)
Restrict data access at database level:

```sql
-- Only users can see their own courses
CREATE POLICY "Users can view own courses"
ON courses
FOR SELECT
USING (creator_id = auth.uid());

-- Only enrolled users can view course content
CREATE POLICY "Enrolled users can view course"
ON topics
FOR SELECT
USING (
  course_id IN (
    SELECT course_id FROM enrollments 
    WHERE user_id = auth.uid()
  )
);
```

### Best Practices:
- ✅ Enable RLS on all tables
- ✅ Use auth.uid() in policies
- ✅ Implement role-based access
- ✅ Regular backups
- ✅ Monitor connections

---

## 🚀 Migration Steps for Your Project

### Phase 1: Database Setup (Week 1)
1. Create Supabase project
2. Create Prisma schema
3. Run migrations
4. Set up authentication

### Phase 2: API Integration (Week 2)
1. Create API routes with Prisma
2. Implement course CRUD
3. Add progress tracking
4. Set up enrollments

### Phase 3: Connect Frontend (Week 2-3)
1. Update course generation to save to database
2. Fetch courses from Supabase
3. Real-time progress updates
4. User authentication

### Phase 4: Video & Storage (Week 3-4)
1. Set up Supabase Storage
2. Upload video handling
3. Generate thumbnails
4. CDN delivery

---

## 📊 Quick Reference

### Connection Details Location:
1. Supabase Dashboard
2. Project Settings (bottom left)
3. Database tab
4. Copy URI connection string

### Example Connection String:
```
postgresql://postgres:abcdef123456@db.abc123xyz.supabase.co:5432/postgres
```

### Breaking It Down:
```
postgresql://    # Protocol
postgres         # Username
:abcdef123456   # Password
@db.abc123xyz   # Host
:5432           # Port
/postgres       # Database name
```

---

## ✅ Supabase vs Alternatives for Your Project

| Feature | Supabase | Firebase | MongoDB |
|---------|----------|----------|---------|
| PostgreSQL | ✅ Yes | ❌ No | ❌ No |
| Complex Queries | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Video Storage | ✅ S3 | ✅ Cloud Storage | ❌ No |
| Real-time | ✅ WebSockets | ✅ Realtime DB | ⭐⭐⭐ |
| Authentication | ✅ Full OAuth | ✅ Built-in | ❌ No |
| Cost for Scale | 💰 Cheap | 💰💰 Expensive | 💰💰 Expensive |
| SQL Queries | ✅ Yes | ❌ No | ❌ No |
| **Recommendation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

**Winner for Your Project**: **Supabase** 🏆

---

## 🎓 Next Steps

1. **Create Supabase Account**: https://supabase.com/
2. **Create New Project**: Select "PostgreSQL"
3. **Copy Connection String**: From project settings
4. **Update .env.local**: Add DATABASE_URL
5. **Install Dependencies**: `npm install @supabase/supabase-js prisma`
6. **Create Schema**: Use provided Prisma schema
7. **Run Migrations**: `npx prisma migrate dev --name init`
8. **Start Building**: Use Prisma in your APIs

---

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs/
- **Supabase Discord**: https://discord.supabase.io
- **Community Help**: https://github.com/supabase/supabase/discussions

---

**Supabase is the perfect choice for your comprehensive course platform!** 🚀

It provides everything you need: robust PostgreSQL database, authentication, storage for videos, real-time capabilities, and excellent scalability - all at a very affordable price.

Ready to set up? Follow the steps above and you'll be connected within 5-10 minutes!
