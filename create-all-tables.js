require('dotenv').config({ path: './test generation/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ynyjhfldcjwsgfmhrbqy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAllTables() {
  console.log('🚀 Creating all database tables in Supabase...\n');

  const allSQL = `
-- ============================================
-- Main Application Tables
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(255),
  profile_image_url TEXT,
  avatar_url TEXT,
  bio TEXT,
  learning_style VARCHAR(50),
  experience_level VARCHAR(50),
  daily_time_commitment VARCHAR(50),
  progress_tracking_preference VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  topic VARCHAR(200) NOT NULL,
  difficulty VARCHAR(50),
  duration VARCHAR(50),
  total_modules INTEGER,
  curriculum_data JSONB,
  ai_generated_content JSONB,
  duration_weeks INTEGER,
  difficulty_level VARCHAR(50),
  is_published BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  duration VARCHAR(50),
  topics JSONB,
  activities JSONB,
  project_description TEXT,
  assessment_type VARCHAR(100),
  youtube_search_query TEXT,
  youtube_video_url VARCHAR(500),
  youtube_video_id VARCHAR(100),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  is_started BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmaps Table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_role VARCHAR(255) NOT NULL,
  to_role VARCHAR(255) NOT NULL,
  timeline_months INTEGER,
  roadmap_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table (Main App)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level VARCHAR(50),
  years_of_experience DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Evaluations Table
CREATE TABLE IF NOT EXISTS skill_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  skill_name VARCHAR(255) NOT NULL,
  difficulty_level VARCHAR(50),
  questions_count INTEGER,
  score DECIMAL(5,2),
  correct_answers INTEGER,
  total_questions INTEGER,
  evaluation_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Enrollments Table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Course Resources Table
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  resource_type VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  is_external BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Interests Table
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_name VARCHAR(100) NOT NULL,
  courses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  learning_goal VARCHAR(500),
  work_preference VARCHAR(100),
  specific_focus TEXT,
  send_reminders BOOLEAN DEFAULT true,
  send_progress_updates BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Reviews Table
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Generation Logs Table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  topic VARCHAR(200),
  model_used VARCHAR(100),
  prompt_template TEXT,
  tokens_used INTEGER,
  generation_time_seconds DECIMAL(10, 2),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  ai_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Learning Goals Table
CREATE TABLE IF NOT EXISTS user_learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_text VARCHAR(500) NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Test Generation Module Tables (Renamed)
-- ============================================

-- Test Skills Table (renamed to avoid conflict)
CREATE TABLE IF NOT EXISTS test_skills (
  id BIGSERIAL PRIMARY KEY,
  skill_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Questions Table
CREATE TABLE IF NOT EXISTS test_questions (
  id BIGSERIAL PRIMARY KEY,
  test_skill_id BIGINT REFERENCES test_skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  main_topic TEXT,
  sub_topic TEXT,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Attempts Table
CREATE TABLE IF NOT EXISTS test_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_skill_id BIGINT REFERENCES test_skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')) DEFAULT 'in-progress',
  score NUMERIC(5,2),
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Main App Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_topic ON courses(topic);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_number ON modules(course_id, module_number);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON skill_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON user_learning_goals(user_id);

-- Test Generation Indexes
CREATE INDEX IF NOT EXISTS idx_test_questions_skill_level ON test_questions(test_skill_id, level);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_skill ON test_attempts(test_skill_id);

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Users policies
CREATE POLICY IF NOT EXISTS "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Courses policies
CREATE POLICY IF NOT EXISTS "Users can read own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

-- Roadmaps policies
CREATE POLICY IF NOT EXISTS "Users can read own roadmaps" ON roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own roadmaps" ON roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own roadmaps" ON roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

-- Skills policies
CREATE POLICY IF NOT EXISTS "Users can read own skills" ON skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own skills" ON skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own skills" ON skills
  FOR UPDATE USING (auth.uid() = user_id);

-- Skill Evaluations policies
CREATE POLICY IF NOT EXISTS "Users can read own evaluations" ON skill_evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own evaluations" ON skill_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
`;

  try {
    console.log('📝 Executing SQL to create all tables...\n');
    
    // Execute SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql: allSQL });

    if (error) {
      console.log('⚠️  Direct SQL execution failed. This is normal.\n');
      console.log('📋 Please manually run the SQL in Supabase SQL Editor:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/ynyjhfldcjwsgfmhrbqy/sql');
      console.log('2. Click "New query"');
      console.log('3. Copy the SQL from: ./create-tables.sql');
      console.log('4. Click "Run"\n');
      
      // Write SQL to file
      const fs = require('fs');
      fs.writeFileSync('create-tables.sql', allSQL);
      console.log('✅ SQL saved to create-tables.sql\n');
      return;
    }

    console.log('✅ All tables created successfully!\n');
    console.log('📊 Tables created:');
    console.log('   - Main App: users, courses, modules, roadmaps, skills, etc.');
    console.log('   - Test Generation: test_skills, test_questions, test_attempts');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 SQL has been saved to create-tables.sql');
    console.log('Please run it manually in Supabase SQL Editor.\n');
    
    const fs = require('fs');
    fs.writeFileSync('create-tables.sql', allSQL);
  }
}

createAllTables();
