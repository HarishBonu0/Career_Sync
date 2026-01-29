-- Migration to align database schema with application code
-- Run this in Supabase SQL Editor

-- 1. Create courses table with correct structure
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Optional, null for now
  title VARCHAR(500) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  duration VARCHAR(50),
  total_modules INTEGER,
  ai_generated_content JSONB,
  is_published BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create course_sections table (replacing modules)
CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create course_lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create lesson_materials table (optional)
CREATE TABLE IF NOT EXISTS lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  material_type VARCHAR(50),
  title VARCHAR(255),
  url TEXT,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create course_resources table
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  resource_type VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_section_id ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);

-- 7. Enable Row Level Security (RLS) - Important for Supabase
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;

-- 8. Create policies to allow public read access (adjust for your needs)
CREATE POLICY "Allow public read access" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON course_sections
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON course_sections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON course_lessons
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON course_lessons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON lesson_materials
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON lesson_materials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON course_resources
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON course_resources
  FOR INSERT WITH CHECK (true);
