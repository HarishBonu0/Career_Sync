// EmailJS OTP Configuration Test
// Run this script to verify EmailJS is configured correctly

const axios = require('axios');
require('dotenv').config();

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

console.log('=== EmailJS Configuration Test ===\n');
console.log('Environment Variables:');
console.log('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing');
console.log('EMAILJS_TEMPLATE_ID:', EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Missing');
console.log('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
console.log('EMAILJS_PRIVATE_KEY:', EMAILJS_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('');

if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
  console.error('❌ Error: Not all EmailJS environment variables are set!');
  console.log('\nPlease ensure the following are in your .env file:');
  console.log('EMAILJS_SERVICE_ID=service_itdedgy');
  console.log('EMAILJS_TEMPLATE_ID=template_d5n3dqm');
  console.log('EMAILJS_PUBLIC_KEY=FZSavRhxo_ozMjVFW');
  console.log('EMAILJS_PRIVATE_KEY=KqZ2k9RApQQDDIqLXbAZj');
  process.exit(1);
}

async function testEmailJS() {
  try {
    console.log('Testing EmailJS API connection...\n');
    
    const testOTP = '123456';
    const testEmail = 'test@example.com'; // This won't actually send, just tests the API
    
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: testEmail,
        otp: testOTP,
      },
    };
    
    console.log('Sending test request to EmailJS API...');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', EMAILJS_PUBLIC_KEY);
    console.log('');
    
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    
    console.log('✅ SUCCESS: EmailJS API connection successful!');
    console.log('Response:', response.data);
    console.log('\nOTP emails should be working correctly.');
    
  } catch (error) {
    console.error('❌ ERROR: EmailJS API test failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    console.log('\nPossible issues:');
    console.log('1. Check that your EmailJS service ID and template ID are correct');
    console.log('2. Verify your EmailJS account is active');
    console.log('3. Check that the template has variables: to_email, otp');
    console.log('4. Ensure your EmailJS private key (access token) is valid');
    process.exit(1);
  }
}

console.log('Starting EmailJS test...\n');
testEmailJS();
