-- Complete Database Setup for Course Generation Platform
-- Execute this entire script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS lesson_materials CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_sections CASCADE;
DROP TABLE IF EXISTS course_resources CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table (optional for now, can be null in courses)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses table (main table)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  duration VARCHAR(50),
  total_modules INTEGER DEFAULT 0,
  ai_generated_content JSONB,
  is_published BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course sections table (modules)
CREATE TABLE course_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Course lessons table
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Lesson materials table
CREATE TABLE lesson_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  material_type VARCHAR(50),
  title VARCHAR(255),
  url TEXT,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Course resources table
CREATE TABLE course_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  resource_type VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
  is_started BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_created_at ON courses(created_at);
CREATE INDEX idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX idx_course_sections_order ON course_sections(course_id, order_index);
CREATE INDEX idx_course_lessons_section_id ON course_lessons(section_id);
CREATE INDEX idx_course_lessons_order ON course_lessons(section_id, order_index);
CREATE INDEX idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);
CREATE INDEX idx_course_resources_course_id ON course_resources(course_id);
CREATE INDEX idx_user_progress_user_course ON user_progress(user_id, course_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for now - adjust for production)
-- Users table
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Courses table
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true) WITH CHECK (true);

-- Course sections table
CREATE POLICY "Allow all operations on course_sections" ON course_sections FOR ALL USING (true) WITH CHECK (true);

-- Course lessons table
CREATE POLICY "Allow all operations on course_lessons" ON course_lessons FOR ALL USING (true) WITH CHECK (true);

-- Lesson materials table
CREATE POLICY "Allow all operations on lesson_materials" ON lesson_materials FOR ALL USING (true) WITH CHECK (true);

-- Course resources table
CREATE POLICY "Allow all operations on course_resources" ON course_resources FOR ALL USING (true) WITH CHECK (true);

-- User progress table
CREATE POLICY "Allow all operations on user_progress" ON user_progress FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for testing (optional)
INSERT INTO users (email, username, full_name) VALUES
  ('test@example.com', 'testuser', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Verification queries
SELECT 'Tables created successfully!' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'courses', 'course_sections', 'course_lessons', 'lesson_materials', 'course_resources', 'user_progress')
ORDER BY table_name;
