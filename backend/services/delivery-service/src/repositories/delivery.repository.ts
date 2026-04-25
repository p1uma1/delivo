import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: string;
  orderId: string;
  riderId?: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiderLocation {
  riderId: string;
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

export class DeliveryRepository {
  private _mapDelivery(row: any): Delivery {
    return {
      id: row.id,
      orderId: row.order_id,
      riderId: row.rider_id,
      status: row.status,
      pickupAddress: row.pickup_address,
      deliveryAddress: row.delivery_address,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private _mapRiderLocation(row: any): RiderLocation {
    return {
      riderId: row.rider_id,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Delivery | null> {
    const res = await query('SELECT * FROM deliveries WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this._mapDelivery(res.rows[0]);
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    const res = await query('SELECT * FROM deliveries WHERE order_id = $1', [orderId]);
    if (res.rows.length === 0) return null;
    return this._mapDelivery(res.rows[0]);
  }

  async findByRiderId(riderId: string): Promise<Delivery[]> {
    const res = await query('SELECT * FROM deliveries WHERE rider_id = $1 ORDER BY created_at DESC', [riderId]);
    return res.rows.map(row => this._mapDelivery(row));
  }

  async create(data: any): Promise<Delivery> {
    const id = uuidv4();
    const status = 'PENDING';
    
    const res = await query(
      `INSERT INTO deliveries (id, order_id, rider_id, status, pickup_address, delivery_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, data.orderId, data.riderId || null, status, data.pickupAddress, data.deliveryAddress]
    );

    return this._mapDelivery(res.rows[0]);
  }

  async update(id: string, data: any): Promise<Delivery> {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt');
    if (fields.length === 0) return this.findById(id) as Promise<Delivery>;

    const setClause = fields.map((f, i) => {
      const dbField = f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `"${dbField}" = $${i + 2}`;
    }).join(', ');
    const values = fields.map(f => (data as any)[f]);

    const res = await query(
      `UPDATE deliveries SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (res.rows.length === 0) throw new Error('Delivery not found');
    return this._mapDelivery(res.rows[0]);
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    const res = await query(
      `UPDATE deliveries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    if (res.rows.length === 0) throw new Error('Delivery not found');
    return this._mapDelivery(res.rows[0]);
  }

  async upsertRiderLocation(riderId: string, latitude: number, longitude: number): Promise<RiderLocation> {
    const res = await query(
      `INSERT INTO rider_locations (rider_id, latitude, longitude)
       VALUES ($1, $2, $3)
       ON CONFLICT (rider_id) 
       DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [riderId, latitude, longitude]
    );
    return this._mapRiderLocation(res.rows[0]);
  }

  async findRiderLocation(riderId: string): Promise<RiderLocation | null> {
    const res = await query('SELECT * FROM rider_locations WHERE rider_id = $1', [riderId]);
    if (res.rows.length === 0) return null;
    return this._mapRiderLocation(res.rows[0]);
  }

  async getCustomerEmailByDeliveryId(deliveryId: string): Promise<string | null> {
    const res = await query(`
      SELECT u.email
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users u ON o.customer_id = u.id
      WHERE d.id = $1
    `, [deliveryId]);
    if (res.rows.length === 0) return null;
    return res.rows[0].email;
  }
}

export const deliveryRepository = new DeliveryRepository();
