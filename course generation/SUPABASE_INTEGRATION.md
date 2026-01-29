# Integrating Supabase with Your Course Generation Project

## 📋 Overview

This guide explains how to integrate Supabase into your existing course generation platform with minimal changes to your current code.

---

## 🚀 Step 1: Create Supabase Project

### 1. Go to Supabase
- **URL**: https://supabase.com/
- Click "Start your project"
- Sign up with GitHub (fastest)

### 2. Create New Project
- **Name**: `unfold-course-platform`
- **Password**: Create strong password (save it!)
- **Region**: Choose closest to you
- **Pricing**: Free tier

### 3. Get Connection String
1. Go to **Settings** → **Database**
2. Copy **URI** connection string
3. Format: `postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres`

### 4. Update `.env.local`
```env
# Supabase Database
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# Supabase URLs
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# Existing Keys (keep these)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔧 Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js prisma @prisma/client
npm install -D prisma
```

---

## 📊 Step 3: Set Up Prisma

### 1. Initialize Prisma
```bash
npx prisma init
```

### 2. Replace `prisma/schema.prisma`
The schema file has already been created with your complete database structure. It includes:
- Users & Authentication
- Courses & Topics
- Learning Journeys
- Enrollments & Progress
- Quizzes & Assessments
- Comments & Reviews

### 3. Push Schema to Supabase
```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in Supabase
- Generate Prisma client
- Set up indexes and relations

### 4. Generate Prisma Client
```bash
npx prisma generate
```

---

## 💾 Step 4: Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🔄 Step 5: Update Your APIs to Use Supabase

### Example: Save Generated Course to Database

**Before (Current)**:
```typescript
// app/api/courses/save/route.ts
// Only saved to sessionStorage

const savedCourse = {
  id: courseId,
  slug,
  title,
  description,
  // ...
}
```

**After (With Supabase)**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, topic, difficulty, modules, objectives } = body

    // Save to Supabase via Prisma
    const course = await prisma.course.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        description,
        topic,
        difficulty,
        learning_objectives: objectives || [],
        creator_id: 'anonymous', // TODO: Get from session
        
        topics: {
          create: modules?.map((mod: any, idx: number) => ({
            title: mod.title,
            description: mod.description,
            content: mod.description,
            order: idx + 1,
          })) || []
        }
      },
      include: { topics: true }
    })

    return NextResponse.json({
      success: true,
      course,
      message: 'Course saved to database'
    })
  } catch (error) {
    console.error('Error saving course:', error)
    return NextResponse.json(
      { error: 'Failed to save course' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

### Example: Fetch Courses from Supabase

```typescript
// app/(main)/courses/page.tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getCoursesServerSide() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: { id: true, name: true, avatar_url: true }
        },
        topics: {
          select: { id: true, title: true }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { published_date: 'desc' },
      take: 20
    })
    
    return courses
  } finally {
    await prisma.$disconnect()
  }
}

export default async function CoursesPage() {
  const courses = await getCoursesServerSide()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
```

### Example: Track User Progress

```typescript
// app/api/courses/[courseId]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json()
    const { topicId, completed, timeSpent } = body
    
    // Update progress
    const progress = await prisma.userProgress.upsert({
      where: {
        user_id_topic_id: {
          user_id: 'user-id-from-session', // TODO: Get from session
          topic_id: topicId
        }
      },
      update: {
        completed,
        time_spent: timeSpent,
      },
      create: {
        user_id: 'user-id-from-session',
        course_id: params.courseId,
        topic_id: topicId,
        completed,
        time_spent: timeSpent
      }
    })

    // Calculate course progress
    const allProgress = await prisma.userProgress.findMany({
      where: { course_id: params.courseId }
    })
    
    const completedCount = allProgress.filter(p => p.completed).length
    const courseProgress = Math.round((completedCount / allProgress.length) * 100)

    return NextResponse.json({
      success: true,
      progress: { ...progress, courseProgress }
    })
  } finally {
    await prisma.$disconnect()
  }
}
```

---

## 🔐 Step 6: Set Up Authentication

### Enable Google OAuth in Supabase

1. Go to Supabase Dashboard
2. **Authentication** → **Providers**
3. Enable "Google"
4. Add Google OAuth credentials from Google Cloud Console

### Update NextAuth Config

```typescript
// lib/auth.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// In your NextAuth config:
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
],

// Save user to Supabase
async callbacks() {
  async signIn({ user, profile }) {
    // Check if user exists in Supabase
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    // Create if doesn't exist
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.name || 'Anonymous',
          avatar_url: user.image,
          google_id: profile?.id
        }
      })
    }

    return true
  }
}
```

---

## 📹 Step 7: Add Video Storage

### Set Up Supabase Storage

1. Go to **Storage** tab in Supabase
2. Create new bucket: `videos`
3. Make it public (for video delivery)

### Upload Video

```typescript
import { supabase } from '@/lib/supabase'

async function uploadVideo(file: File, courseId: string) {
  const fileName = `${courseId}/${Date.now()}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file)

  if (error) throw error

  return data.path
}
```

### Display Video

```typescript
const { data: { publicUrl } } = supabase.storage
  .from('videos')
  .getPublicUrl(videoPath)

// Use publicUrl in video player
<video src={publicUrl} controls />
```

---

## ✅ Migration Checklist

### Setup Phase
- [ ] Create Supabase project
- [ ] Get connection string
- [ ] Update .env.local
- [ ] Install dependencies
- [ ] Push schema to Supabase (`npx prisma migrate dev`)

### API Integration Phase
- [ ] Update `/api/courses/save` to use Prisma
- [ ] Update `/api/courses/[courseId]/progress` to use Prisma
- [ ] Update `/api/generate-course` to save to database
- [ ] Update course browse pages to fetch from Supabase
- [ ] Set up authentication

### Frontend Updates
- [ ] Update home page to fetch real courses
- [ ] Update course detail page
- [ ] Update lesson viewer to track progress
- [ ] Add real-time updates (optional)

### Testing
- [ ] Test course generation and save
- [ ] Test course fetching
- [ ] Test progress tracking
- [ ] Test authentication
- [ ] Test video upload and display

---

## 🚀 Example: Complete Integration

### 1. User creates course
```
User → Generate Course → AI generates → Save to Supabase DB
```

### 2. User browses courses
```
Browse Page → Fetch from Supabase → Display courses
```

### 3. User watches lesson
```
Lesson Page → Fetch from Supabase → Play video → Track progress
```

### 4. User enrolls
```
Enroll Button → Save to Enrollments table → Update progress
```

---

## 📚 Your New Database Includes

✅ **User Management**
- User accounts and profiles
- Google OAuth integration
- Role-based access (learner, educator, admin)

✅ **Course Management**
- Courses and topics
- Generated course tracking
- Course metadata and objectives

✅ **Progress Tracking**
- User progress per topic
- Time spent on lessons
- Completion status

✅ **Learning Journeys**
- Collections of courses
- Enrollment tracking
- Prerequisites management

✅ **Engagement**
- Quizzes and assessments
- Comments and discussions
- Reviews and ratings

✅ **Certificates**
- Issue certificates on completion
- Store certificate URLs

---

## 🔄 Keep Your Existing Features

Your current features still work:

✅ OpenRouter API key integration
✅ Course generation wizard
✅ 10-question personalization
✅ Video player
✅ Lesson viewer

**Now they'll:**
- Save to database instead of sessionStorage
- Fetch real courses
- Track real progress
- Support multiple users

---

## 💡 Next: Add Real Features

Once Supabase is integrated, you can easily add:

1. **User Accounts** - Sign in with Google
2. **Course Library** - Browse real courses
3. **My Courses** - Saved and in-progress courses
4. **Certificates** - Issue on completion
5. **Educator Tools** - Dashboard for creators
6. **Discussions** - Comments on courses
7. **Analytics** - View student progress

---

## 🎯 Timeline

**Total Integration Time**: 2-3 hours

- Supabase Setup: 5 min
- Prisma Setup: 10 min
- Push Schema: 5 min
- API Updates: 45 min
- Authentication: 30 min
- Testing: 30 min

---

## 📞 Help & Support

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs/
- **Discord**: https://discord.supabase.io
- **Issues**: Check GitHub discussions

---

**You're ready to go from prototype to production!** 🚀

Follow the steps above and your course platform will be backed by enterprise-grade PostgreSQL database with Supabase.
