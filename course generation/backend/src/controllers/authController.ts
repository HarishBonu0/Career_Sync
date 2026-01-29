import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection';
import { hashPassword, comparePassword } from '../utils/passwordHash';
import { ApiError } from '../middleware/errorHandler';
import { nanoid } from 'nanoid';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ApiError(400, 'User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = nanoid();

    // Create user
    const result = await query(
      `INSERT INTO users (id, email, name, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role, created_at`,
      [userId, email, name, passwordHash, 'learner']
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, name, password_hash, role, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    throw error;
  }
};
