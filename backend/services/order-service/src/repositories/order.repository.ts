import { query } from '../lib/db';
import { randomUUID } from 'crypto';

export type OrderStatus = 'PENDING' | 'WAITING_FOR_RIDER_OFFERS' | 'RIDER_SELECTED' | 'ACCEPTED_BY_MERCHANT' | 'PREPARING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'ASSIGNED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  merchantId: string;
  merchantName?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  itemTotal: number;
  selectedDeliveryFee: number;
  status: OrderStatus;
  notes?: string;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const res = await query(
      `SELECT o.*, mp.business_name as merchant_name 
       FROM orders o
       LEFT JOIN merchant_profiles mp ON o.merchant_id = mp.user_id
       WHERE o.id = $1`, 
      [id]
    );
    if (res.rows.length === 0) return null;

    const order = this.mapToOrder(res.rows[0]);
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsRes.rows.map(this.mapToOrderItem);

    return order;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const res = await query(
      `SELECT o.*, mp.business_name as merchant_name 
       FROM orders o
       LEFT JOIN merchant_profiles mp ON o.merchant_id = mp.user_id
       WHERE o.customer_id = $1 
       ORDER BY o.created_at DESC`, 
      [customerId]
    );
    return res.rows.map(this.mapToOrder);
  }

  async create(data: any): Promise<Order> {
    const id = randomUUID();
    const {
      customerId,
      merchantId,
      merchantName,
      pickupAddress,
      deliveryAddress,
      notes,
      items
    } = data;

    const itemTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    await query('BEGIN');
    try {
      const res = await query(
        `INSERT INTO orders (id, customer_id, merchant_id, pickup_address, drop_address, item_total, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id, customerId, merchantId, pickupAddress, deliveryAddress, itemTotal, notes]
      );

      for (const item of items) {
        const itemId = randomUUID();
        await query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [itemId, id, item.productId, item.name, item.quantity, item.price]
        );
      }

      await query('COMMIT');
      return this.mapToOrder(res.rows[0]);
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (res.rows.length === 0) throw new Error('Order not found');
    return this.mapToOrder(res.rows[0]);
  }

  private mapToOrder(row: any): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      merchantId: row.merchant_id,
      merchantName: row.merchant_name,
      pickupAddress: row.pickup_address,
      deliveryAddress: row.drop_address,
      itemTotal: parseFloat(row.item_total),
      selectedDeliveryFee: parseFloat(row.selected_delivery_fee),
      status: row.status as OrderStatus,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      productName: row.product_name,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price)
    };
  }
}

export const orderRepository = new OrderRepository();
