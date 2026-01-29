-- Create Test Skills Table (renamed to avoid conflict with main app skills table)
CREATE TABLE IF NOT EXISTS test_skills (
  id BIGSERIAL PRIMARY KEY,
  skill_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Test Questions Table (renamed for clarity)
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

-- Create Test Attempts Table (renamed for clarity)
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

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_test_questions_skill_level ON test_questions(test_skill_id, level);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_skill ON test_attempts(test_skill_id);

-- Enable Row Level Security (Optional - disable if you want public access)
-- ALTER TABLE test_skills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Create Policies for public access (if RLS is disabled, these are not needed)
-- CREATE POLICY "Enable read access for all users" ON test_skills FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON test_skills FOR INSERT WITH CHECK (true);
