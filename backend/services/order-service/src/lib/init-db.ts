import { query } from './db';

const schema = `
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    merchant_name VARCHAR(255),
    pickup_address TEXT,
    pickup_latitude NUMERIC,
    pickup_longitude NUMERIC,
    drop_address TEXT,
    drop_latitude NUMERIC,
    drop_longitude NUMERIC,
    item_total NUMERIC(10,2) DEFAULT 0,
    selected_delivery_fee NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function initDatabase() {
  try {
    await query(schema);
    console.log('[order-service] Database tables initialized');
  } catch (err) {
    console.error('[order-service] Failed to initialize database tables', err);
    throw err;
  }
}
