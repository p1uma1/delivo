import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductRepository {
  private _mapProduct(row: any): Product {
    return {
      id: row.id,
      merchantId: row.merchant_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      imageUrl: row.image_url,
      stock: parseInt(row.stock, 10),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const res = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this._mapProduct(res.rows[0]);
  }

  async findAll(filters?: { category?: string; search?: string }): Promise<Product[]> {
    let sql = 'SELECT * FROM products WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }

    if (filters?.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    const res = await query(sql, params);
    return res.rows.map(row => this._mapProduct(row));
  }

  async findByMerchantId(merchantId: string): Promise<Product[]> {
    const res = await query('SELECT * FROM products WHERE merchant_id = $1 ORDER BY created_at DESC', [merchantId]);
    return res.rows.map(row => this._mapProduct(row));
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = uuidv4();
    const res = await query(
      `INSERT INTO products (id, merchant_id, name, description, price, category, image_url, stock, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        data.merchantId,
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.stock,
        data.isActive ?? true
      ]
    );

    return this._mapProduct(res.rows[0]);
  }

  async update(id: string, merchantId: string, data: Partial<Product>): Promise<Product> {
    const fields = Object.keys(data).filter(k => 
      k !== 'id' && k !== 'merchantId' && k !== 'createdAt' && k !== 'updatedAt'
    );
    
    if (fields.length === 0) return this.findById(id) as Promise<Product>;

    const setClause = fields.map((f, i) => {
      const dbField = f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `"${dbField}" = $${i + 3}`; // $1 is id, $2 is merchant_id
    }).join(', ');
    
    const values = fields.map(f => (data as any)[f]);

    const res = await query(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND merchant_id = $2 
       RETURNING *`,
      [id, merchantId, ...values]
    );

    if (res.rows.length === 0) throw new Error('Product not found or unauthorized');
    return this._mapProduct(res.rows[0]);
  }

  async delete(id: string, merchantId: string): Promise<void> {
    const res = await query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND merchant_id = $2',
      [id, merchantId]
    );
    if (res.rowCount === 0) throw new Error('Product not found or unauthorized');
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const res = await query(
      'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1',
      [quantity, productId]
    );
    if (res.rowCount === 0) {
      throw new Error(`Failed to decrement stock for product ${productId}: Insufficient stock or not found`);
    }
  }
}

export const productRepository = new ProductRepository();
