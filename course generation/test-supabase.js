// Quick Test Script - Verify Supabase Connection
// Run with: node test-supabase.js (from course generation folder)

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynyjhfldcjwsgfmhrbqy.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM'

console.log('🔍 Testing Supabase Connection...\n')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...\n')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Check if we can query the courses table
    console.log('📋 Test 1: Checking courses table...')
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ FAILED: courses table does not exist!')
        console.log('   👉 You need to run the database migration first.')
        console.log('   👉 See: database/migration_fix_schema.sql\n')
        return false
      }
      console.log('❌ Error:', error.message, '\n')
      return false
    }
    
    console.log('✅ courses table exists')
    console.log('   Found', data?.length || 0, 'course(s)\n')
    
    // Test 2: Check course_sections table
    console.log('📋 Test 2: Checking course_sections table...')
    const { error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .limit(1)
    
    if (sectionsError) {
      console.log('❌ course_sections table issue:', sectionsError.message, '\n')
      return false
    }
    
    console.log('✅ course_sections table exists\n')
    
    // Test 3: Check course_lessons table
    console.log('📋 Test 3: Checking course_lessons table...')
    const { error: lessonsError } = await supabase
      .from('course_lessons')
      .select('*')
      .limit(1)
    
    if (lessonsError) {
      console.log('❌ course_lessons table issue:', lessonsError.message, '\n')
      return false
    }
    
    console.log('✅ course_lessons table exists\n')
    
    console.log('🎉 All tests passed! Database is ready.\n')
    return true
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message, '\n')
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('✨ Your Supabase connection is working perfectly!')
    console.log('✨ You can proceed with deployment.')
  } else {
    console.log('⚠️  Fix the issues above before deploying.')
    console.log('⚠️  Run the migration SQL in Supabase SQL Editor.')
  }
  process.exit(success ? 0 : 1)
})
