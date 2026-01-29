# Course Generation Module - Complete Documentation

## Overview
The Course Generation Module is a comprehensive AI-powered system that creates personalized learning courses based on user inputs. It uses AI (OpenRouter with Mistral) to generate structured, personalized course content.

## ✅ Completed Features

### 1. **Multi-Step Course Generation Wizard** (`/generate/[topic]`)
- ✅ 10-question personalized intake form
- ✅ Dynamic question flow with context-aware prompts
- ✅ Multiple question types (text, single-choice, multiple-choice)
- ✅ Progress tracking with visual step indicators
- ✅ Review page with conversational summary
- ✅ Real-time generation with loading states

### 2. **AI-Powered Course Generation** (`/api/generate-course`)
- ✅ Integration with OpenRouter API (Mistral model)
- ✅ Personalized prompt generation based on user answers
- ✅ Structured JSON course output
- ✅ Fallback handling for non-JSON responses
- ✅ Error handling and validation

### 3. **Generated Course Display** (`/course-generated/[id]`)
- ✅ Beautiful course overview page
- ✅ Display of learning objectives
- ✅ Prerequisites listing
- ✅ Module/topic breakdown
- ✅ Resources section
- ✅ Download course as JSON
- ✅ Save to database functionality
- ✅ Create another course option

### 4. **Lesson/Topic Viewing Page** (`/course/[slug]/topic/[topicId]`)
- ✅ Two-column layout (video + content)
- ✅ Custom HTML5 video player with:
  - Play/pause controls
  - Progress bar with seek functionality
  - Playback speed control (0.5x - 2x)
  - Volume control
  - Skip ±10 seconds
  - Topics/chapters dropdown menu
- ✅ Synchronized lesson content display
- ✅ Markdown content rendering
- ✅ Progress tracking (mark as completed)
- ✅ Navigation between topics
- ✅ Share functionality

### 5. **Course Management APIs**
- ✅ `/api/courses/save` - Save generated courses
- ✅ `/api/courses/[courseId]/progress` - Track user progress
- ✅ `/api/generate-course` - AI course generation
- ✅ `/api/search` - Search courses and journeys

### 6. **Home Page** (`/home`)
- ✅ Hero section with course creation search
- ✅ Topic pills for quick access
- ✅ Learning Journeys section
- ✅ User-generated courses section
- ✅ Infinite scroll for courses

### 7. **Course Discovery** (`/courses`)
- ✅ Browse all courses
- ✅ Filter by category
- ✅ Search functionality
- ✅ Pagination

## 📂 File Structure

```
course generation/
├── app/
│   ├── (main)/
│   │   ├── generate/
│   │   │   └── [topic]/
│   │   │       └── page.tsx              ✅ Course generation wizard
│   │   ├── course/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              ✅ Course overview
│   │   │       └── topic/
│   │   │           └── [topicId]/
│   │   │               └── page.tsx      ✅ NEW: Lesson viewer with video
│   │   ├── course-generated/
│   │   │   └── [id]/
│   │   │       └── page.tsx              ✅ Generated course display
│   │   ├── home/
│   │   │   └── page.tsx                  ✅ Home page
│   │   └── courses/
│   │       └── page.tsx                  ✅ Course browsing
│   └── api/
│       ├── generate-course/
│       │   └── route.ts                  ✅ AI generation endpoint
│       ├── courses/
│       │   ├── save/
│       │   │   └── route.ts              ✅ NEW: Save course API
│       │   └── [courseId]/
│       │       └── progress/
│       │           └── route.ts          ✅ NEW: Progress tracking API
│       └── search/
│           └── route.ts                  ✅ Search API
├── components/
│   ├── home/
│   │   ├── HeroSection.tsx               ✅ Hero with search
│   │   └── TopicPills.tsx                ✅ Topic selection
│   ├── courses/
│   │   └── CourseCard.tsx                ✅ Course display card
│   └── journeys/
│       └── JourneyCard.tsx               ✅ Journey display card
├── backend/
│   └── src/
│       ├── controllers/
│       │   └── courseController.ts       ✅ Course CRUD operations
│       └── routes/
│           └── courses.ts                ✅ Course routes
├── database/
│   ├── schema.sql                        ✅ Database schema
│   └── seeds.sql                         ✅ Seed data
└── .env.local                            ✅ Environment configuration
```

## 🔑 API Keys Required

### OpenRouter API Key (REQUIRED for course generation)

The system uses OpenRouter to access AI models for course generation.

**How to get your OpenRouter API Key:**

1. **Sign up for OpenRouter**
   - Go to: https://openrouter.ai/
   - Click "Sign Up" or "Get Started"
   - Create an account (you can use Google/GitHub login)

2. **Get your API Key**
   - Once logged in, go to: https://openrouter.ai/keys
   - Click "Create Key"
   - Give it a name (e.g., "Unfold Course Generator")
   - Copy the generated key (starts with `sk-or-v1-...`)

3. **Add credits (if needed)**
   - Go to: https://openrouter.ai/credits
   - Add credits to your account ($5-10 is plenty to start)
   - OpenRouter charges per token used

4. **Add to your .env.local file**
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

**Cost Estimate:**
- Mistral 7B model: ~$0.001 per course generation
- Very affordable for testing and development
- Monitor usage at: https://openrouter.ai/activity

### Optional API Keys

These are optional but recommended for future enhancements:

#### Google OAuth (for authentication)
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### PostgreSQL Database
```env
DATABASE_URL=postgresql://user:password@localhost:5432/unfold
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth (optional)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# Database (optional - for production)
DATABASE_URL=postgresql://user:password@localhost:5432/unfold
```

### 3. Start the Development Server
```bash
npm run dev
```

The app will be available at: http://localhost:3000

### 4. Test Course Generation
1. Navigate to http://localhost:3000/home
2. Enter a topic in the search bar (e.g., "Machine Learning")
3. Answer the 10 personalization questions
4. Review your profile
5. Click "Next" to generate the course
6. View your personalized course curriculum

## 📖 User Flow

### Course Creation Flow
1. **Home Page** → User enters a topic
2. **Generate Page** → User answers 10 personalization questions
3. **Review Page** → User reviews their learning profile
4. **Generation** → AI creates personalized curriculum
5. **Course Display** → User views complete course structure
6. **Save/Download** → User can save to library or download

### Course Learning Flow
1. **Course Overview** → View all topics and modules
2. **Start Topic** → Click "Start" on any topic
3. **Lesson Page** → Watch video + read content
4. **Mark Complete** → Track progress
5. **Next Topic** → Continue to next lesson

## 🎨 Key Components

### Course Generation Wizard
- **Location**: `app/(main)/generate/[topic]/page.tsx`
- **Features**:
  - 10-step questionnaire
  - Dynamic question rendering
  - Progress tracking
  - Review before generation

### Video Player
- **Location**: `app/(main)/course/[slug]/topic/[topicId]/page.tsx`
- **Features**:
  - HTML5 video with custom controls
  - Speed control (0.5x - 2x)
  - Progress bar
  - Topic navigation
  - Completion tracking

### AI Generation
- **Location**: `app/api/generate-course/route.ts`
- **Model**: Mistral 7B Instruct (via OpenRouter)
- **Output**: Structured JSON curriculum

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts
- `courses` - Course metadata
- `topics` - Individual lessons
- `learning_journeys` - Course collections
- `enrollments` - User progress tracking
- `educator_applications` - Educator registrations

### Relationships
- Courses → Many Topics
- Users → Many Enrollments
- Journeys → Many Courses

## 🔧 Customization

### Change AI Model
Edit `app/api/generate-course/route.ts`:
```typescript
model: 'mistralai/mistral-7b-instruct', // Change this
```

Available models:
- `anthropic/claude-3-opus` - Best quality
- `openai/gpt-4` - High quality
- `google/gemini-pro` - Good balance
- `mistralai/mistral-7b-instruct` - Fastest/cheapest

### Customize Questions
Edit `app/(main)/generate/[topic]/page.tsx`:
```typescript
const questions: Question[] = [
  // Add/modify questions here
]
```

### Styling
- Uses Tailwind CSS
- Global styles in `app/globals.css`
- Component-level styling in each file

## 🐛 Troubleshooting

### "OpenRouter API key not configured"
- Make sure `.env.local` exists
- Check the API key is correct
- Restart the dev server after adding the key

### Video player not working
- Videos need to be actual video files (mp4, webm)
- YouTube links won't work with HTML5 `<video>` tag
- Use video hosting services or local files

### Course not generating
- Check OpenRouter account has credits
- Verify API key is valid
- Check browser console for errors
- Check Network tab for API response

## 📝 Next Steps / Future Enhancements

### Recommended Additions:
1. **Database Integration**
   - Connect Prisma ORM
   - Persist generated courses
   - Save user progress

2. **Authentication**
   - Implement NextAuth.js
   - Google OAuth login
   - Protected routes

3. **Video Hosting**
   - Integrate video service (Vimeo, Cloudinary)
   - Upload and process videos
   - Generate thumbnails

4. **Advanced Features**
   - Quizzes and assessments
   - Certificates
   - Discussion forums
   - Social sharing

5. **Analytics**
   - Track user engagement
   - Course completion rates
   - Popular topics

## 📄 License
This project is part of the Unfold Platform clone.

## 🤝 Support
For issues or questions, check the API documentation at:
- OpenRouter: https://openrouter.ai/docs
- Next.js: https://nextjs.org/docs
