/**
 * Supabase Tables Functionality Test
 * This script tests all tables to ensure they're working properly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynyjhfldcjwsgfmhrbqy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log results
function logTest(tableName, status, message = '') {
  const timestamp = new Date().toLocaleTimeString();
  const statusSymbol = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  
  console.log(`${color}${statusSymbol}${colors.reset} [${timestamp}] ${tableName}: ${message}`);
  
  const result = { table: tableName, message, timestamp };
  
  if (status === 'pass') {
    testResults.passed.push(result);
  } else if (status === 'fail') {
    testResults.failed.push(result);
  } else {
    testResults.warnings.push(result);
  }
}

// Test table existence and basic operations
async function testTable(tableName, testData = null) {
  try {
    // Test 1: Read operation (check if table exists)
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logTest(tableName, 'fail', `Read failed: ${error.message}`);
      return false;
    }
    
    logTest(tableName, 'pass', `Table exists with ${count || 0} rows`);
    
    // Test 2: Schema check (get column info)
    const { data: schemaData, error: schemaError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (!schemaError && schemaData && schemaData.length > 0) {
      const columns = Object.keys(schemaData[0]).join(', ');
      logTest(tableName, 'pass', `Schema columns: ${columns}`);
    }
    
    return true;
  } catch (err) {
    logTest(tableName, 'fail', `Exception: ${err.message}`);
    return false;
  }
}

// Test foreign key relationships
async function testRelationships() {
  console.log(`\n${colors.blue}=== Testing Table Relationships ===${colors.reset}\n`);
  
  try {
    // Test courses -> modules relationship
    const { data: coursesWithModules, error: e1 } = await supabase
      .from('courses')
      .select('id, title, modules(*)')
      .limit(1);
    
    if (e1) {
      logTest('courses->modules', 'fail', e1.message);
    } else {
      logTest('courses->modules', 'pass', 'Foreign key relationship works');
    }
    
    // Test courses -> user_progress relationship
    const { data: coursesWithProgress, error: e2 } = await supabase
      .from('courses')
      .select('id, user_progress(*)')
      .limit(1);
    
    if (e2) {
      logTest('courses->user_progress', 'fail', e2.message);
    } else {
      logTest('courses->user_progress', 'pass', 'Foreign key relationship works');
    }
    
    // Test users -> courses relationship
    const { data: usersWithCourses, error: e3 } = await supabase
      .from('users')
      .select('id, email, courses(*)')
      .limit(1);
    
    if (e3) {
      logTest('users->courses', 'fail', e3.message);
    } else {
      logTest('users->courses', 'pass', 'Foreign key relationship works');
    }
    
  } catch (err) {
    logTest('relationships', 'fail', `Exception: ${err.message}`);
  }
}

// Test indexes performance
async function testIndexes() {
  console.log(`\n${colors.blue}=== Testing Index Performance ===${colors.reset}\n`);
  
  try {
    // Test email index on users
    const start1 = Date.now();
    await supabase.from('users').select('*').eq('email', 'test@example.com');
    const time1 = Date.now() - start1;
    logTest('users.email_index', 'pass', `Query took ${time1}ms`);
    
    // Test course_id index on modules
    const start2 = Date.now();
    await supabase.from('modules').select('*').eq('course_id', '00000000-0000-0000-0000-000000000000');
    const time2 = Date.now() - start2;
    logTest('modules.course_id_index', 'pass', `Query took ${time2}ms`);
    
    // Test user_id index on courses
    const start3 = Date.now();
    await supabase.from('courses').select('*').eq('user_id', '00000000-0000-0000-0000-000000000000');
    const time3 = Date.now() - start3;
    logTest('courses.user_id_index', 'pass', `Query took ${time3}ms`);
    
  } catch (err) {
    logTest('indexes', 'fail', `Exception: ${err.message}`);
  }
}

// Main test function
async function runTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Supabase Tables Functionality Test Suite    ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.blue}=== Testing Core Application Tables ===${colors.reset}\n`);
  
  // Core tables
  await testTable('users');
  await testTable('courses');
  await testTable('modules');
  await testTable('user_progress');
  
  console.log(`\n${colors.blue}=== Testing Feature Tables ===${colors.reset}\n`);
  
  // Feature tables
  await testTable('roadmaps');
  await testTable('skills');
  await testTable('skill_evaluations');
  await testTable('course_enrollments');
  await testTable('course_resources');
  await testTable('user_interests');
  await testTable('user_preferences');
  await testTable('course_reviews');
  await testTable('ai_generation_logs');
  await testTable('user_learning_goals');
  
  console.log(`\n${colors.blue}=== Testing Test Generation Module Tables ===${colors.reset}\n`);
  
  // Test generation module tables
  await testTable('test_skills');
  await testTable('test_questions');
  await testTable('test_attempts');
  
  // Test relationships
  await testRelationships();
  
  // Test indexes
  await testIndexes();
  
  // Print summary
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║              Test Results Summary              ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.green}✓ Passed:${colors.reset} ${testResults.passed.length}`);
  console.log(`${colors.red}✗ Failed:${colors.reset} ${testResults.failed.length}`);
  console.log(`${colors.yellow}⚠ Warnings:${colors.reset} ${testResults.warnings.length}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`Total Tests: ${testResults.passed.length + testResults.failed.length + testResults.warnings.length}\n`);
  
  // Show failed tests details
  if (testResults.failed.length > 0) {
    console.log(`\n${colors.red}Failed Tests Details:${colors.reset}`);
    testResults.failed.forEach(test => {
      console.log(`  ${colors.red}✗${colors.reset} ${test.table}: ${test.message}`);
    });
    console.log();
  }
  
  // Show warnings details
  if (testResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}Warnings Details:${colors.reset}`);
    testResults.warnings.forEach(test => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${test.table}: ${test.message}`);
    });
    console.log();
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
