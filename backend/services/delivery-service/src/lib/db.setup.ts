import { query } from './db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const initDB = async () => {
  try {
    console.log('Initializing database for delivery-service...');

    await query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        rider_id VARCHAR(50),
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        pickup_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS rider_locations (
        rider_id VARCHAR(50) PRIMARY KEY,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit(0);
  }
};

initDB();
