import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { extractToken } from '../utils/token.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function attachUserFromToken(req, token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id).select('email name role');
  if (!user) return false;

  req.user = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return true;
}

/**
 * Require valid JWT (Bearer header or Career_Sync_token cookie).
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const ok = await attachUserFromToken(req, token);
    if (!ok) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Attach user when token present; do not block the request.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      await attachUserFromToken(req, token);
    }
  } catch {
    // ignore invalid optional tokens
  }
  next();
};

export { extractToken, JWT_SECRET };
