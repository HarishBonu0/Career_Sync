require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// You need to get the SERVICE ROLE key from Supabase (not the anon key)
// Go to: Project Settings > API > service_role key (secret)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating database tables...\n');

  const createSkillsSQL = `
    CREATE TABLE IF NOT EXISTS skills (
      id BIGSERIAL PRIMARY KEY,
      skill_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createQuestionsSQL = `
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
  `;

  const createAttemptsSQL = `
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
  `;

  const createIndexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_questions_skill_level ON questions(skill_id, level);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_skill ON test_attempts(skill_id);
  `;

  try {
    // Try to execute raw SQL (requires service_role key)
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createSkillsSQL + createQuestionsSQL + createAttemptsSQL + createIndexesSQL 
    });

    if (error) {
      console.error('❌ Cannot create tables programmatically.');
      console.log('\n📋 Please copy and paste this SQL into Supabase SQL Editor:\n');
      console.log('Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql\n');
      console.log(createSkillsSQL);
      console.log(createQuestionsSQL);
      console.log(createAttemptsSQL);
      console.log(createIndexesSQL);
      console.log('\n✅ After running the SQL, restart the servers.\n');
      return;
    }

    console.log('✅ Tables created successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Please create tables manually in Supabase SQL Editor:\n');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "New query"');
    console.log('4. Copy and paste the following SQL:\n');
    
    const fullSQL = `
-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  skill_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
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

-- Test Attempts Table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_skill_level ON questions(skill_id, level);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_skill ON test_attempts(skill_id);
`;
    
    console.log(fullSQL);
    console.log('\n5. Click "Run" or press Ctrl+Enter');
    console.log('6. You should see "Success. No rows returned"');
    console.log('7. Restart both backend and frontend servers\n');
  }
}

createTables();
