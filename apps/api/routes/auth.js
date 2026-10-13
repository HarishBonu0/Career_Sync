import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/email.js';
import { getDeviceInfo, generateSessionId } from '../utils/deviceDetector.js';
import { extractToken } from '../utils/token.js';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { requireMongo } from '../middleware/mongoCheck.js';
import rateLimit from 'express-rate-limit';
import { getCorsOrigins } from '../config/urls.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is missing in production');
}
const ACTIVE_JWT_SECRET = JWT_SECRET || 'your-secret-key-change-in-production';
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setAuthCookie(res, token) {
  res.cookie('Career_Sync_token', token, COOKIE_OPTIONS);
}

const GOOGLE_STATE_COOKIE = 'Career_Sync_google_state';
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

function getGoogleConfig(req) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;
  let redirectUri = process.env.GOOGLE_CALLBACK_URL;
  if (process.env.NODE_ENV === 'production' && redirectUri && redirectUri.includes('localhost')) {
    redirectUri = null;
  }
  if (!redirectUri && req) {
    redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  }
  if (!redirectUri) return null;
  return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, redirectUri };
}

function getGoogleClient(config) {
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function resolveSafeFrontendUrl(candidate) {
  if (!candidate) return getFrontendUrl();
  try {
    const url = new URL(candidate);
    const origin = url.origin;
    const allowed = getCorsOrigins();
    if (
      allowed.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return origin;
    }
  } catch {
    // ignore malformed URL
  }
  return getFrontendUrl();
}

function redirectToLogin(res, code, customFrontendUrl) {
  const base = customFrontendUrl || getFrontendUrl();
  return res.redirect(`${base}/login?oauth_error=${encodeURIComponent(code)}`);
}

function statesMatch(expected, actual) {
  if (!expected || !actual || expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

// Register
router.post(
  '/register',
  requireMongo,
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, name, phone } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'User already exists' });

      const passwordHash = await bcryptjs.hash(password, 10);
      const user = await User.create({ email, passwordHash, name, phone });

      const token = jwt.sign({ id: user._id, email: user.email }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
      setAuthCookie(res, token);
      res.json({ message: 'User registered successfully', token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    }
  }
);

// Signup alias
router.post('/signup', (req, res, next) => router.handle(Object.assign(req, { url: '/register', originalUrl: '/api/auth/signup' }), res, next));

// Login
router.post(
  '/login',
  authLimiter,
  requireMongo,
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, deviceInfo } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      if (!user.passwordHash || !user.authProviders?.includes('email')) {
        return res.status(401).json({ error: 'This account uses Google sign-in' });
      }

      const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
      if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const detectedDeviceInfo = await getDeviceInfo(req);
      const mergedDeviceInfo = { ...detectedDeviceInfo, ...deviceInfo };
      await user.recordDeviceLogin(mergedDeviceInfo);

      const sessionId = generateSessionId();
      const token = jwt.sign({ id: user._id, email: user.email, sessionId }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
      setAuthCookie(res, token);

      res.json({ message: 'Login successful', token, user: user.toSafeObject(), devices: user.getActiveDevices(), sessionId, lastSyncAt: user.lastProfileUpdateAt });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    }
  }
);

// Request OTP
router.post(
  '/request-otp',
  authLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });

    const otp = generateOtp();
    const otpHash = await bcryptjs.hash(otp, 10);
    user.otpCode = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.json({ message: 'OTP sent to email' });

    sendOtpEmail({ toEmail: email, otp, serviceId: EMAILJS_SERVICE_ID, templateId: EMAILJS_TEMPLATE_ID, publicKey: EMAILJS_PUBLIC_KEY, privateKey: EMAILJS_PRIVATE_KEY }).catch((err) => {
      console.error('Background OTP email send failed:', err?.message || err);
    });
  } catch (error) {
    console.error('OTP request error:', error?.message || error);
    res.status(500).json({ error: 'Failed to send OTP', detail: process.env.NODE_ENV === 'production' ? '' : (error?.message || '') });
  }
});

// Login with OTP
router.post(
  '/login-otp',
  authLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isString().isLength({ min: 4, max: 8 }).withMessage('OTP is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, otp, deviceInfo } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(401).json({ error: 'OTP not requested or invalid' });
    if (user.otpExpiresAt.getTime() < Date.now()) return res.status(401).json({ error: 'OTP expired, request a new one' });

    const isValid = await bcryptjs.compare(otp, user.otpCode);
    if (!isValid) return res.status(401).json({ error: 'Invalid OTP' });

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    const detectedDeviceInfo = await getDeviceInfo(req);
    const mergedDeviceInfo = { ...detectedDeviceInfo, ...deviceInfo };
    await user.recordDeviceLogin(mergedDeviceInfo);

    const sessionId = generateSessionId();
    const token = jwt.sign({ id: user._id, email: user.email, sessionId }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    res.json({ message: 'Login successful', user: user.toSafeObject(), devices: user.getActiveDevices(), sessionId, lastSyncAt: user.lastProfileUpdateAt });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// Reset password using OTP
router.post(
  '/reset-password',
  authLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isString().isLength({ min: 4, max: 8 }).withMessage('OTP is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, otp, newPassword } = req.body;
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

      user.passwordHash = await bcryptjs.hash(newPassword, 10);
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
      setAuthCookie(res, token);

      res.json({ message: 'Password reset successful', user: user.toSafeObject(), token });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    }
  }
);

// Verify token (ad-hoc)
router.post(
  '/verify',
  body('token').isString().withMessage('token is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { token } = req.body;
    try {
      const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name');
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ message: 'Token is valid', user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout (clear cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('Career_Sync_token', { path: '/' });
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  if (process.env.BYPASS_AUTH === 'true') {
    return res.json({ user: req.user });
  }
  try {
    const user = await User.findById(req.user.id).select('email name role');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Protected device & profile endpoints use authenticate middleware
router.get('/devices', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ devices: user.getActiveDevices(), syncedAt: user.lastProfileUpdateAt });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

router.post('/sync-devices', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const syncData = await user.syncToAllDevices();
    res.json({ message: 'Devices synced successfully', ...syncData });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

router.post(
  '/update-profile',
  authenticate,
  body('name').optional().isString().isLength({ max: 200 }),
  body('phone').optional().isString().isLength({ max: 50 }),
  body('metadata').optional().custom((v) => typeof v === 'object' || v === null),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { name, phone, metadata } = req.body;
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (metadata) user.metadata = { ...user.metadata, ...metadata };
      await user.updateCredentialsAcrossDevices({ name, phone, metadata });
      res.json({ message: 'Profile updated across all devices', user: user.toSafeObject(), devices: user.getActiveDevices(), syncedAt: user.lastProfileUpdateAt });
    } catch (error) {
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    }
  }
);

router.post(
  '/logout-device',
  authenticate,
  body('deviceId').isString().withMessage('deviceId is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { deviceId } = req.body;
      const deviceIndex = user.devices.findIndex((d) => d.deviceId === deviceId);
      if (deviceIndex >= 0) {
        user.devices[deviceIndex].isActive = false;
        await user.save();
      }
      res.json({ message: 'Device logged out', devices: user.getActiveDevices() });
    } catch (error) {
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    }
  }
);

router.post('/logout-all-devices', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.devices.forEach((device) => (device.isActive = false));
    user.activeSessions = [];
    await user.save();
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// Begin the server-side Google OAuth authorization-code flow.
router.get('/google', (req, res) => {
  const config = getGoogleConfig(req);
  const targetFrontendUrl = resolveSafeFrontendUrl(req.query.origin || req.headers.referer);

  if (!config) {
    console.error('[AUTH GOOGLE] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.');
    return redirectToLogin(res, 'not_configured', targetFrontendUrl);
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const statePayload = {
    nonce,
    targetOrigin: targetFrontendUrl,
  };
  const state = jwt.sign(statePayload, ACTIVE_JWT_SECRET, { expiresIn: '15m' });

  res.cookie(GOOGLE_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/api/auth/google',
  });

  const client = getGoogleClient(config);
  const authorizationUrl = client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: GOOGLE_SCOPES,
    state,
  });
  return res.redirect(authorizationUrl);
});

router.get('/google/callback', async (req, res) => {
  const config = getGoogleConfig(req);
  let targetFrontendUrl = getFrontendUrl();

  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const expectedNonce = req.cookies?.[GOOGLE_STATE_COOKIE] || '';
  res.clearCookie(GOOGLE_STATE_COOKIE, { path: '/api/auth/google' });

  let stateValid = false;
  if (state) {
    try {
      const decoded = jwt.verify(state, ACTIVE_JWT_SECRET);
      if (decoded && decoded.nonce) {
        stateValid = true;
        if (decoded.targetOrigin) {
          targetFrontendUrl = resolveSafeFrontendUrl(decoded.targetOrigin);
        }
      }
    } catch {
      if (expectedNonce && statesMatch(expectedNonce, state)) {
        stateValid = true;
      }
    }
  }

  if (!config) {
    return redirectToLogin(res, 'not_configured', targetFrontendUrl);
  }

  if (req.query.error === 'access_denied') {
    return redirectToLogin(res, 'cancelled', targetFrontendUrl);
  }

  if (!stateValid) {
    return redirectToLogin(res, 'invalid_state', targetFrontendUrl);
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  if (!code) {
    return redirectToLogin(res, 'missing_code', targetFrontendUrl);
  }

  try {
    const client = getGoogleClient(config);
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) return redirectToLogin(res, 'missing_identity', targetFrontendUrl);

    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: config.clientId });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email?.toLowerCase();
    if (!googleId || !email || payload.email_verified !== true) {
      return redirectToLogin(res, 'unverified_account', targetFrontendUrl);
    }

    let user = await User.findOne({ googleId });
    if (user && user.email !== email) return redirectToLogin(res, 'account_conflict', targetFrontendUrl);

    if (!user) user = await User.findByEmail(email);
    if (!user) {
      user = await User.create({
        email,
        name: payload.name || email.split('@')[0],
        avatar: payload.picture,
        googleId,
        provider: 'google',
        authProviders: ['google'],
        status: 'active',
      });
    } else {
      user.googleId = googleId;
      user.avatar = payload.picture || user.avatar;
      user.authProviders = [...new Set([...(user.authProviders || []), 'google'])];
      user.provider = user.authProviders.includes('email') ? 'both' : 'google';
      await user.save();
    }

    await user.recordLogin();
    const token = jwt.sign({ id: user._id, email: user.email }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    return res.redirect(`${targetFrontendUrl}/home?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('Google OAuth callback failed:', error?.message || error);
    return redirectToLogin(res, 'authentication_failed', targetFrontendUrl);
  }
});

// Retain the old route as an explicit rejection; browser-supplied identity is not trusted.
router.post('/google-signin', (req, res) => {
  res.status(410).json({ error: 'Google Sign-In moved to GET /api/auth/google' });
});

export default router;
