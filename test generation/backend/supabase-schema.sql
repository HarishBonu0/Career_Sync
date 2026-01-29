-- Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  skill_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  skill_id BIGINT REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  main_topic TEXT,
  sub_topic TEXT,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Test Attempts Table
CREATE TABLE IF NOT EXISTS test_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  skill_id BIGINT REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')) DEFAULT 'in-progress',
  score NUMERIC(5,2),
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_questions_skill_level ON questions(skill_id, level);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_skill ON test_attempts(skill_id);

-- Enable Row Level Security (Optional - disable if you want public access)
-- ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Create Policies for public access (if RLS is disabled, these are not needed)
-- CREATE POLICY "Enable read access for all users" ON skills FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON skills FOR INSERT WITH CHECK (true);
