-- ============================================
-- PROJECT EXPO - Complete Database Schema
-- ============================================
-- This script creates all necessary tables for the full-stack platform
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores user account information, preferences, and metadata
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
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USER PREFERENCES TABLE
-- ============================================
-- Stores user-specific settings and preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- ============================================
-- 3. USER INTERESTS TABLE
-- ============================================
-- Tracks topics and interests of users
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_name VARCHAR(100) NOT NULL,
  courses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, interest_name)
);

-- ============================================
-- 4. SKILLS TABLE
-- ============================================
-- Stores user skills and proficiency levels
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level VARCHAR(50),
  years_of_experience DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. COURSES TABLE
-- ============================================
-- Main courses table for AI-generated and user-created courses
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

-- ============================================
-- 6. MODULES TABLE (Course Sections)
-- ============================================
-- Stores modules/sections within courses
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, module_number)
);

-- ============================================
-- 7. USER PROGRESS TABLE
-- ============================================
-- Tracks user progress in courses and modules
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id)
);

-- ============================================
-- 8. COURSE ENROLLMENTS TABLE
-- ============================================
-- Tracks which users are enrolled in which courses
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- ============================================
-- 9. COURSE RESOURCES TABLE
-- ============================================
-- Stores additional resources for courses (PDFs, links, etc.)
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

-- ============================================
-- 10. COURSE REVIEWS TABLE
-- ============================================
-- Stores reviews and ratings for courses
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, user_id)
);

-- ============================================
-- 11. ROADMAPS TABLE
-- ============================================
-- Stores career/learning roadmaps for users
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

-- ============================================
-- 12. SKILL EVALUATIONS TABLE
-- ============================================
-- Stores skill assessment results
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

-- ============================================
-- 13. AI GENERATION LOGS TABLE
-- ============================================
-- Tracks AI-generated content creation
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

-- ============================================
-- 14. USER LEARNING GOALS TABLE
-- ============================================
-- Tracks user learning goals and objectives
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
-- 15. TEST SKILLS TABLE
-- ============================================
-- Stores available skills for testing
CREATE TABLE IF NOT EXISTS test_skills (
  id BIGSERIAL PRIMARY KEY,
  skill_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 16. TEST QUESTIONS TABLE
-- ============================================
-- Stores test questions for skill evaluations
CREATE TABLE IF NOT EXISTS test_questions (
  id BIGSERIAL PRIMARY KEY,
  test_skill_id BIGINT NOT NULL REFERENCES test_skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  main_topic TEXT,
  sub_topic TEXT,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 17. TEST ATTEMPTS TABLE
-- ============================================
-- Tracks user test attempts and scores
CREATE TABLE IF NOT EXISTS test_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_skill_id BIGINT NOT NULL REFERENCES test_skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')) DEFAULT 'in-progress',
  score NUMERIC(5,2),
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- User Preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON user_preferences(user_id);

-- User Interests indexes
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);

-- Skills indexes
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_skill_name ON skills(skill_name);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_topic ON courses(topic);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);

-- Modules indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_number ON modules(course_id, module_number);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(display_order);

-- User Progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_course ON user_progress(user_id, course_id);

-- Course Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON course_enrollments(completed);

-- Course Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON course_resources(course_id);

-- Course Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON course_reviews(user_id);

-- Roadmaps indexes
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);

-- Skill Evaluations indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON skill_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_skill_name ON skill_evaluations(skill_name);

-- AI Logs indexes
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_generation_logs(created_at);

-- Learning Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON user_learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON user_learning_goals(is_completed);

-- Test indexes
CREATE INDEX IF NOT EXISTS idx_test_questions_skill_level ON test_questions(test_skill_id, level);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_skill ON test_attempts(test_skill_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Users policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Courses policies
DROP POLICY IF EXISTS "Users can read own courses" ON courses;
CREATE POLICY "Users can read own courses" ON courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own courses" ON courses;
CREATE POLICY "Users can insert own courses" ON courses
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own courses" ON courses;
CREATE POLICY "Users can update own courses" ON courses
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own courses" ON courses;
CREATE POLICY "Users can delete own courses" ON courses
  FOR DELETE USING (true);

-- Modules policies
DROP POLICY IF EXISTS "Users can read modules" ON modules;
CREATE POLICY "Users can read modules" ON modules
  FOR SELECT USING (true);

-- User Progress policies
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
CREATE POLICY "Users can read own progress" ON user_progress
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (true);

-- Course Enrollments policies
DROP POLICY IF EXISTS "Users can read enrollments" ON course_enrollments;
CREATE POLICY "Users can read enrollments" ON course_enrollments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create enrollments" ON course_enrollments;
CREATE POLICY "Users can create enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (true);

-- Roadmaps policies
DROP POLICY IF EXISTS "Users can read own roadmaps" ON roadmaps;
CREATE POLICY "Users can read own roadmaps" ON roadmaps
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own roadmaps" ON roadmaps;
CREATE POLICY "Users can insert own roadmaps" ON roadmaps
  FOR INSERT WITH CHECK (true);

-- Skills policies
DROP POLICY IF EXISTS "Users can read own skills" ON skills;
CREATE POLICY "Users can read own skills" ON skills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own skills" ON skills;
CREATE POLICY "Users can insert own skills" ON skills
  FOR INSERT WITH CHECK (true);

-- Skill Evaluations policies
DROP POLICY IF EXISTS "Users can read own evaluations" ON skill_evaluations;
CREATE POLICY "Users can read own evaluations" ON skill_evaluations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own evaluations" ON skill_evaluations;
CREATE POLICY "Users can insert own evaluations" ON skill_evaluations
  FOR INSERT WITH CHECK (true);

-- Test Skills policies
DROP POLICY IF EXISTS "Anyone can read test skills" ON test_skills;
CREATE POLICY "Anyone can read test skills" ON test_skills
  FOR SELECT USING (true);

-- Test Questions policies
DROP POLICY IF EXISTS "Anyone can read test questions" ON test_questions;
CREATE POLICY "Anyone can read test questions" ON test_questions
  FOR SELECT USING (true);

-- Test Attempts policies
DROP POLICY IF EXISTS "Users can read own attempts" ON test_attempts;
CREATE POLICY "Users can read own attempts" ON test_attempts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create attempts" ON test_attempts;
CREATE POLICY "Users can create attempts" ON test_attempts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own attempts" ON test_attempts;
CREATE POLICY "Users can update own attempts" ON test_attempts
  FOR UPDATE USING (true);

-- ============================================
-- CREATE SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample test skills
INSERT INTO test_skills (skill_name, description) VALUES
  ('Python', 'Python Programming Language'),
  ('JavaScript', 'JavaScript Web Development'),
  ('SQL', 'Database Query Language'),
  ('React', 'React.js Frontend Framework'),
  ('Node.js', 'Node.js Backend Runtime'),
  ('Docker', 'Container Orchestration'),
  ('AWS', 'Amazon Web Services'),
  ('MongoDB', 'NoSQL Database'),
  ('Git', 'Version Control System'),
  ('Machine Learning', 'ML and AI Concepts')
ON CONFLICT (skill_name) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT 'Database schema creation completed successfully!' as status;

SELECT 
  'Tables Summary' as type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;
