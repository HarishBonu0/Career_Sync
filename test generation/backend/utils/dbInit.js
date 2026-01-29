const supabase = require('../config/supabase');

async function initializeDatabase() {
  console.log('🔧 Initializing database tables...');

  try {
    // Check if tables exist by trying to query them
    const { error: skillsError } = await supabase
      .from('skills')
      .select('id')
      .limit(1);

    const { error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);

    const { error: attemptsError } = await supabase
      .from('test_attempts')
      .select('id')
      .limit(1);

    // Check if tables exist (error code PGRST116 means table not found)
    const tablesExist = 
      (!skillsError || skillsError.code !== 'PGRST116') &&
      (!questionsError || questionsError.code !== 'PGRST116') &&
      (!attemptsError || attemptsError.code !== 'PGRST116');

    if (tablesExist) {
      console.log('✅ Database tables already exist');
      return true;
    }

    console.log('⚠️ Tables not found. Please create them manually in Supabase SQL Editor.');
    console.log('\nRun this SQL in your Supabase dashboard:\n');
    console.log(`
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
  level TEXT NOT NULL,
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
  level TEXT NOT NULL,
  status TEXT DEFAULT 'in-progress',
  score NUMERIC(5,2),
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_questions_skill_level ON questions(skill_id, level);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
    `);
    
    return false;

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}

module.exports = { initializeDatabase };
