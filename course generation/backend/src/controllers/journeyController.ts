import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db/connection';
import { ApiError } from '../middleware/errorHandler';
import { nanoid } from 'nanoid';
import { generateUniqueSlug } from '../utils/slugify';

export const getAllJourneys = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT j.*, u.name as creator_name, u.avatar_url as creator_avatar,
              (SELECT COUNT(*) FROM courses WHERE journey_id = j.id) as course_count
       FROM learning_journeys j
       LEFT JOIN users u ON j.creator_id = u.id
       ORDER BY j.published_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM learning_journeys');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        journeys: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getJourneyBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT j.*, u.name as creator_name, u.avatar_url as creator_avatar
       FROM learning_journeys j
       LEFT JOIN users u ON j.creator_id = u.id
       WHERE j.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Journey not found');
    }

    const journey = result.rows[0];

    // Get courses in this journey
    const coursesResult = await query(
      `SELECT c.*, u.name as creator_name
       FROM courses c
       LEFT JOIN users u ON c.creator_id = u.id
       WHERE c.journey_id = $1
       ORDER BY c.published_date DESC`,
      [journey.id]
    );

    journey.courses = coursesResult.rows;

    res.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    throw error;
  }
};

export const createJourney = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      subtitle,
      description,
      who_is_for,
      who_is_not_for,
      start_date,
      thumbnail_url,
    } = req.body;

    const journeyId = nanoid();
    const slug = generateUniqueSlug(title, journeyId);
    const creatorId = req.user!.id;

    const result = await query(
      `INSERT INTO learning_journeys 
       (id, title, slug, subtitle, description, who_is_for, who_is_not_for, 
        published_date, start_date, creator_id, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)
       RETURNING *`,
      [
        journeyId,
        title,
        slug,
        subtitle,
        description,
        who_is_for,
        who_is_not_for,
        start_date,
        creatorId,
        thumbnail_url,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    throw error;
  }
};

export const updateJourney = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      who_is_for,
      who_is_not_for,
      start_date,
      thumbnail_url,
    } = req.body;

    // Check if journey exists and user is the creator
    const checkResult = await query(
      'SELECT creator_id FROM learning_journeys WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(404, 'Journey not found');
    }

    if (checkResult.rows[0].creator_id !== req.user!.id) {
      throw new ApiError(403, 'Not authorized to update this journey');
    }

    const slug = title ? generateUniqueSlug(title, id) : undefined;

    const result = await query(
      `UPDATE learning_journeys 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           subtitle = COALESCE($3, subtitle),
           description = COALESCE($4, description),
           who_is_for = COALESCE($5, who_is_for),
           who_is_not_for = COALESCE($6, who_is_not_for),
           start_date = COALESCE($7, start_date),
           thumbnail_url = COALESCE($8, thumbnail_url),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title,
        slug,
        subtitle,
        description,
        who_is_for,
        who_is_not_for,
        start_date,
        thumbnail_url,
        id,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    throw error;
  }
};

export const deleteJourney = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if journey exists and user is the creator
    const checkResult = await query(
      'SELECT creator_id FROM learning_journeys WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      throw new ApiError(404, 'Journey not found');
    }

    if (checkResult.rows[0].creator_id !== req.user!.id) {
      throw new ApiError(403, 'Not authorized to delete this journey');
    }

    await query('DELETE FROM learning_journeys WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Journey deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
