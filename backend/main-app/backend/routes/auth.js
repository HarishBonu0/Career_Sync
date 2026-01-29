import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register/Signup endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, phone });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for signup
router.post('/signup', async (req, res) => {
  return router.handle(Object.assign(req, { url: '/register', originalUrl: '/api/auth/signup' }), res);
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request OTP (email) for login
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const otp = generateOtp();
    const otpHash = await bcryptjs.hash(otp, 10);

    user.otpCode = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Respond immediately, send email in background
    res.json({ message: 'OTP sent to email' });

    sendOtpEmail({
      toEmail: email,
      otp,
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    }).catch((err) => {
      console.error('Background OTP email send failed:', err.message);
    });
  } catch (error) {
    console.error('OTP request error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP', detail: error.message });
  }
});

// Login with OTP
router.post('/login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(401).json({ error: 'OTP not requested or invalid' });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: 'OTP expired, request a new one' });
    }

    const isValid = await bcryptjs.compare(otp, user.otpCode);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    user.lastLoginAt = new Date();
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ 
      message: 'Token is valid',
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(401).json({ error: 'OTP not requested or invalid' });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: 'OTP expired, request a new one' });
    }

    const isValid = await bcryptjs.compare(otp, user.otpCode);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Update password
    const passwordHash = await bcryptjs.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate token for auto-login
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      message: 'Password reset successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Password reset error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Signup alias
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, phone });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
