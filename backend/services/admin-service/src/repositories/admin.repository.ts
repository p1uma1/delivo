import { query } from '../lib/db';

export class AdminRepository {
  // ─── Platform Operations / Analytics ──────────────────────────────────────────
  
  async getPlatformStats(): Promise<any> {
    const usersCountRes = await query('SELECT COUNT(*) FROM users');
    const ordersCountRes = await query('SELECT COUNT(*) FROM orders');
    const productsCountRes = await query('SELECT COUNT(*) FROM products');
    const deliveriesCountRes = await query('SELECT COUNT(*) FROM deliveries');

    return {
      totalUsers: parseInt(usersCountRes.rows[0].count, 10),
      totalOrders: parseInt(ordersCountRes.rows[0].count, 10),
      totalProducts: parseInt(productsCountRes.rows[0].count, 10),
      totalDeliveries: parseInt(deliveriesCountRes.rows[0].count, 10),
    };
  }

  // ─── User Management ─────────────────────────────────────────────────────────

  async getAllUsers(): Promise<any[]> {
    const res = await query('SELECT id, email, name, role, is_active as "isActive", created_at as "createdAt" FROM users ORDER BY created_at DESC');
    return res.rows;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    const res = await query('UPDATE users SET is_active = $1 WHERE id = $2', [isActive, userId]);
    if (res.rowCount === 0) throw new Error('User not found');
  }

  // ─── Order Monitoring ────────────────────────────────────────────────────────

  async getAllOrders(): Promise<any[]> {
    const res = await query(`
      SELECT o.id, o.status, o.total_amount as "totalAmount", o.created_at as "createdAt",
             u.name as "customerName", u.email as "customerEmail",
             d.id as "deliveryId", d.status as "deliveryStatus",
             r.name as "riderName"
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN deliveries d ON d.order_id = o.id
      LEFT JOIN users r ON d.rider_id = r.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);
    return res.rows.map(row => ({
      ...row,
      totalAmount: parseFloat(row.totalAmount)
    }));
  }

  // ─── Product Management ──────────────────────────────────────────────────────

  async getAllProducts(): Promise<any[]> {
    const res = await query(`
      SELECT p.id, p.name, p.price, p.stock, p.is_active as "isActive", p.created_at as "createdAt",
             u.name as "merchantName"
      FROM products p
      JOIN users u ON p.merchant_id = u.id
      ORDER BY p.created_at DESC
    `);
    return res.rows.map(row => ({
      ...row,
      price: parseFloat(row.price)
    }));
  }

  async updateProductStatus(productId: string, isActive: boolean): Promise<void> {
    const res = await query('UPDATE products SET is_active = $1 WHERE id = $2', [isActive, productId]);
    if (res.rowCount === 0) throw new Error('Product not found');
  }
}

export const adminRepository = new AdminRepository();
