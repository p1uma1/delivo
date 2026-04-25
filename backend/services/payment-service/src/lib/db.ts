import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded before pool is created
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
