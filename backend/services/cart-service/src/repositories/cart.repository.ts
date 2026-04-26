import { query } from '../lib/db';

export interface CartItem {
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  merchantId: string | null;
  merchantName: string | null;
}

export class CartRepository {
  async getCart(customerId: string): Promise<CartState> {
    const cartRes = await query('SELECT * FROM carts WHERE customer_id = $1', [customerId]);
    
    if (cartRes.rows.length === 0) {
      // Create a new cart if it doesn't exist
      const newCartRes = await query(
        'INSERT INTO carts (customer_id) VALUES ($1) RETURNING *',
        [customerId]
      );
      return { items: [], merchantId: null, merchantName: null };
    }

    const cart = cartRes.rows[0];
    const itemsRes = await query(
      `SELECT ci.*, u.name as merchant_name 
       FROM cart_items ci
       LEFT JOIN users u ON ci.merchant_id = u.id
       WHERE ci.cart_id = $1`, 
      [cart.id]
    );
    
    const items: CartItem[] = itemsRes.rows.map(row => ({
      productId: row.product_id,
      productName: row.product_name,
      merchantId: row.merchant_id,
      merchantName: row.merchant_name || 'Merchant',
      unitPrice: parseFloat(row.unit_price),
      quantity: row.quantity
    }));

    return {
      items,
      merchantId: items.length > 0 ? items[0].merchantId : null,
      merchantName: items.length > 0 ? items[0].merchantName : null
    };
  }

  async addItem(customerId: string, item: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<CartItem> {
    const cartState = await this.getCart(customerId);
    const cartRes = await query('SELECT id FROM carts WHERE customer_id = $1', [customerId]);
    const cartId = cartRes.rows[0].id;

    // Check if adding from a different merchant
    console.log(`[CartRepo] Adding item from merchant ${item.merchantId}. Current cart merchant: ${cartState.merchantId}. Item count: ${cartState.items.length}`);
    
    if (cartState.merchantId && String(cartState.merchantId) !== String(item.merchantId) && cartState.items.length > 0) {
      console.error(`[CartRepo] Merchant mismatch: ${cartState.merchantId} !== ${item.merchantId}`);
      throw new Error('Cannot add items from a different merchant. Please clear your cart first.');
    }

    const quantity = item.quantity || 1;

    await query('BEGIN');
    try {
      // Upsert cart item
      await query(
        `INSERT INTO cart_items (cart_id, product_id, product_name, merchant_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [cartId, item.productId, item.productName, item.merchantId, quantity, item.unitPrice]
      );

      await query('COMMIT');
      
      // Return the added/updated item (simplified)
      return { ...item, quantity }; 
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  async updateItemQuantity(customerId: string, productId: string, quantity: number): Promise<void> {
    const cartRes = await query('SELECT id FROM carts WHERE customer_id = $1', [customerId]);
    if (cartRes.rows.length === 0) throw new Error('Cart not found');
    const cartId = cartRes.rows[0].id;

    if (quantity <= 0) {
      await this.removeItem(customerId, productId);
      return;
    }

    await query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE cart_id = $2 AND product_id = $3',
      [quantity, cartId, productId]
    );
  }

  async removeItem(customerId: string, productId: string): Promise<void> {
    const cartRes = await query('SELECT id FROM carts WHERE customer_id = $1', [customerId]);
    if (cartRes.rows.length === 0) return;
    const cartId = cartRes.rows[0].id;

    await query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
  }

  async clearCart(customerId: string): Promise<void> {
    const cartRes = await query('SELECT id FROM carts WHERE customer_id = $1', [customerId]);
    if (cartRes.rows.length === 0) return;
    const cartId = cartRes.rows[0].id;

    await query('BEGIN');
    try {
      await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }
}

export const cartRepository = new CartRepository();
