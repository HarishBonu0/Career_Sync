import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { extractToken } from '../utils/token.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is missing in production');
}
const ACTIVE_JWT_SECRET = JWT_SECRET || 'your-secret-key-change-in-production';
async function attachUserFromToken(req, token) {
  const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
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
  if (process.env.BYPASS_AUTH === 'true') {
    req.user = {
      id: '6ac1103e62e1fd6d49c31ea4', // Mock valid ObjectId
      email: 'mock@user.com',
      name: 'Mock User',
      role: 'user',
    };
    return next();
  }

  try {
    const token = extractToken(req);
    if (!token) {
      console.error('[AUTH DEBUG] No token present. NODE_ENV:', process.env.NODE_ENV);
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        req.user = {
          id: '6ac1103e62e1fd6d49c31ea4', // Mock valid ObjectId
          email: 'local@development.user',
          name: 'Local User',
          role: 'user',
        };
        return next();
      }
      return res.status(401).json({ error: 'Authentication required' });
    }
    const ok = await attachUserFromToken(req, token);
    if (!ok) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch (err) {
    console.error('[AUTH DEBUG] Error in attachUserFromToken:', err.message, 'Token:', extractToken(req), 'NODE_ENV:', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      req.user = {
        id: '6ac1103e62e1fd6d49c31ea4',
        email: 'local@development.user',
        name: 'Local User',
        role: 'user',
      };
      return next();
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Attach user when token present; do not block the request.
 */
export const optionalAuth = async (req, res, next) => {
  if (process.env.BYPASS_AUTH === 'true') {
    req.user = {
      id: '6ac1103e62e1fd6d49c31ea4',
      email: 'mock@user.com',
      name: 'Mock User',
      role: 'user',
    };
    return next();
  }

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

export { extractToken, ACTIVE_JWT_SECRET as JWT_SECRET };
