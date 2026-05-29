import axios from 'axios';

export async function sendOtpEmail({ toEmail, otp, serviceId, templateId, publicKey, privateKey }) {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS serviceId, templateId, and publicKey are required');
  }

  // Map our OTP variables to the EmailJS template variables the user provided
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  const templateParams = {
    passcode: otp,
    time: expiry.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    email: toEmail,
  };

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    // EmailJS REST API uses `accessToken` for the private key in strict mode.
    ...(privateKey ? { accessToken: privateKey } : {}),
    template_params: templateParams,
  };

  console.log('📧 Sending OTP email (EmailJS) to:', toEmail);
  console.log('📦 EmailJS payload:', JSON.stringify(payload));
  try {
    const resp = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    console.log('✅ OTP email send response status:', resp.status);
    return resp.data;
  } catch (err) {
    console.error('❌ EmailJS send failed:', err.response?.status, err.response?.data || err.message);
    throw err;
  }
}
