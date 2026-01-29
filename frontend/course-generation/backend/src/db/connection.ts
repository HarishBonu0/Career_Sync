import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let dbConnected = false;

try {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'unfold_db',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    dbConnected = false;
  });
} catch (error) {
  console.warn('Database pool creation failed, running in mock mode');
  pool = null;
}

export const query = async (text: string, params?: any[]) => {
  if (!pool || !dbConnected) {
    throw new Error('Database not available - using mock data');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = () => {
  if (!pool) {
    throw new Error('Database not available');
  }
  return pool.connect();
};

export const isDatabaseConnected = () => dbConnected;

export const setDatabaseConnected = (status: boolean) => {
  dbConnected = status;
};

export default pool;
