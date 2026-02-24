import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Extract JWT from request.
 * Priority: HttpOnly cookie (same-domain) → Authorization: Bearer header (cross-domain)
 */
function extractToken(req) {
  // 1. HttpOnly cookie (set by backend on same-domain login)
  if (req.cookies && req.cookies.Career_Sync_token) {
    return req.cookies.Career_Sync_token;
  }
  // 2. Authorization header (cross-domain: localStorage JWT sent by other Render services)
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

/**
 * Middleware to verify JWT from HttpOnly cookie OR Authorization header.
 * Supports cross-domain authentication for separately deployed frontend modules.
 * Attaches user object to req.user if authenticated.
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token exists (cookie or header), but doesn't block request
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('email name');
      
      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          name: user.name
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};
