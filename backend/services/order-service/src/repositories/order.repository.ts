import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export class OrderRepository {
  private _mapOrder(row: any): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      status: row.status,
      pickupAddress: row.pickup_address,
      deliveryAddress: row.delivery_address,
      totalAmount: parseFloat(row.total_amount),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private _mapOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      price: parseFloat(row.price),
    };
  }

  async findById(id: string): Promise<Order | null> {
    const res = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    
    const order = this._mapOrder(res.rows[0]);
    
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsRes.rows.map(row => this._mapOrderItem(row));
    
    return order;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const res = await query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
    return res.rows.map(row => this._mapOrder(row));
  }

  async create(data: any): Promise<Order> {
    const orderId = uuidv4();
    const status = 'PENDING';
    
    // In a real application, you'd use a transaction here.
    const res = await query(
      `INSERT INTO orders (id, customer_id, status, pickup_address, delivery_address, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orderId, data.customerId, status, data.pickupAddress, data.deliveryAddress, data.totalAmount]
    );

    const order = this._mapOrder(res.rows[0]);
    order.items = [];

    const items = data.items?.create || [];
    for (const item of items) {
      const itemId = uuidv4();
      const itemRes = await query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [itemId, orderId, item.productId, item.quantity, item.price]
      );
      order.items.push(this._mapOrderItem(itemRes.rows[0]));
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    if (res.rows.length === 0) throw new Error('Order not found');
    return this._mapOrder(res.rows[0]);
  }
}

export const orderRepository = new OrderRepository();
