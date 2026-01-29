import { Request, Response } from 'express';
import { query } from '../db/connection';

export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM topics ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    throw error;
  }
};
