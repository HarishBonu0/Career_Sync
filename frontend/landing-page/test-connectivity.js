// Diagnostic script for testing backend connectivity
// Run this in browser console at http://localhost:4173/auth.html

async function testBackendConnection() {
  console.log('🔧 Starting backend connectivity test...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const resp = await fetch(`${API_BASE}/health`);
    if (resp.ok) {
      const data = await resp.json();
      console.log('✅ Health check passed:', data);
    } else {
      console.log('❌ Health check failed:', resp.status, resp.statusText);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
  
  console.log('\nTest 2: CORS check');
  try {
    const resp = await fetch(`${API_BASE}/health`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS preflight response:', resp.status);
  } catch (error) {
    console.log('❌ CORS check error:', error.message);
  }
  
  console.log('\nTest 3: Login endpoint');
  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        email: 'test@skillroute.ai', 
        password: 'Test@1234' 
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      console.log('✅ Login successful:', data);
    } else {
      console.log('❌ Login failed:', resp.status, data);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  
  console.log('\nTest 4: Cookie check');
  console.log('Cookies:', document.cookie);
  
  console.log('\n✅ Diagnostics complete!');
}

// Run the test
testBackendConnection();
