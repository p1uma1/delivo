import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentRepository {
  private _mapPayment(row: any): Payment {
    return {
      id: row.id,
      orderId: row.order_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      paymentMethod: row.payment_method,
      stripePaymentIntentId: row.stripe_payment_intent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Payment | null> {
    const res = await query('SELECT * FROM payments WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this._mapPayment(res.rows[0]);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const res = await query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    if (res.rows.length === 0) return null;
    return this._mapPayment(res.rows[0]);
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const id = uuidv4();
    const status = data.status || 'PENDING';
    const currency = data.currency || 'usd';
    const paymentMethod = data.paymentMethod || 'card';

    const res = await query(
      `INSERT INTO payments (id, order_id, amount, currency, status, payment_method, stripe_payment_intent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, data.orderId, data.amount, currency, status, paymentMethod, data.stripePaymentIntentId || null]
    );

    return this._mapPayment(res.rows[0]);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const res = await query(
      `UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    if (res.rows.length === 0) throw new Error('Payment not found');
    return this._mapPayment(res.rows[0]);
  }

  async getCustomerEmailByOrderId(orderId: string): Promise<string | null> {
    const res = await query(`
      SELECT u.email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
    `, [orderId]);
    if (res.rows.length === 0) return null;
    return res.rows[0].email;
  }
}

export const paymentRepository = new PaymentRepository();
