/**
 * Automated Database Setup Script
 * This script will create all necessary tables in Supabase
 * Run: node setup-database.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://ynyjhfldcjwsgfmhrbqy.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI1NzI4MywiZXhwIjoyMDgyODMzMjgzfQ.K_37Gd07tS-9DgoTlpen4f1Y15NFLHZP3aFHJPsKnAk'

console.log('🚀 Starting database setup...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('📋 Creating database tables...\n')

    // Read SQL file
    const sqlPath = path.join(__dirname, 'database', 'SETUP_DATABASE.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Execute SQL using Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      console.log('❌ Failed to execute SQL via REST API')
      console.log('📝 Please run the SQL manually in Supabase SQL Editor:\n')
      console.log('1. Go to: https://supabase.com/dashboard/project/ynyjhfldcjwsgfmhrbqy/sql/new')
      console.log('2. Copy contents of: database/SETUP_DATABASE.sql')
      console.log('3. Paste and click "RUN"\n')
      return false
    }

    console.log('✅ Database setup complete!\n')
    
    // Verify tables
    console.log('🔍 Verifying tables...\n')
    const tables = ['courses', 'course_sections', 'course_lessons']
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Table '${table}' not accessible:`, error.message)
      } else {
        console.log(`✅ Table '${table}' verified`)
      }
    }

    console.log('\n🎉 Database is ready for use!')
    return true

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n📝 Manual Setup Required:')
    console.log('1. Go to: https://supabase.com/dashboard/project/ynyjhfldcjwsgfmhrbqy/sql/new')
    console.log('2. Copy contents of: database/SETUP_DATABASE.sql')
    console.log('3. Paste and click "RUN"\n')
    return false
  }
}

setupDatabase().then(success => {
  process.exit(success ? 0 : 1)
})
