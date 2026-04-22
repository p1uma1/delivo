import pkg from 'pg';
const { Pool } = pkg;

// Assumptions: Environment variables are loaded in the application entry point (index.ts)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
