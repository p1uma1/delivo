const pool = require("../db/db");

const createProduct = async (data) => {
  const { name, description, price, category, stock, merchant_id, image_url } = data;

  const result = await pool.query(
    `INSERT INTO products 
    (name, description, price, category, stock, merchant_id, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [name, description, price, category, stock, merchant_id, image_url]
  );

  return result.rows[0];
};

const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT p.*, mp.business_name as merchant_name 
    FROM products p
    LEFT JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
    ORDER BY p.id DESC
  `);
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, mp.business_name as merchant_name 
     FROM products p
     LEFT JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
     WHERE p.id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateProduct = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (let key in data) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE products 
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await pool.query(
    "DELETE FROM products WHERE id=$1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

const searchProducts = async (query) => {
  const result = await pool.query(
    `SELECT p.*, mp.business_name as merchant_name 
     FROM products p
     LEFT JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
     WHERE p.name ILIKE $1`,
    [`%${query}%`]
  );

  return result.rows;
};

const getProductsByCategory = async (category) => {
  const result = await pool.query(
    `SELECT p.*, mp.business_name as merchant_name 
     FROM products p
     LEFT JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
     WHERE p.category = $1 ORDER BY p.id DESC`,
    [category]
  );

  return result.rows;
};

const getProductsByMerchant = async (merchantId) => {
  const result = await pool.query(
    `SELECT p.*, mp.business_name as merchant_name 
     FROM products p
     LEFT JOIN merchant_profiles mp ON p.merchant_id = mp.user_id
     WHERE p.merchant_id = $1 ORDER BY p.id DESC`,
    [merchantId]
  );

  return result.rows;
};

const reduceStock = async (id, quantity) => {
  // Use a single query with a WHERE clause to ensure stock is sufficient
  const result = await pool.query(
    `UPDATE products 
     SET stock = stock - $2
     WHERE id = $1 AND stock >= $2
     RETURNING *`,
    [id, quantity]
  );

  if (result.rowCount === 0) {
    // Check if product exists to provide a better error message
    const product = await pool.query("SELECT stock FROM products WHERE id = $1", [id]);
    if (product.rowCount === 0) throw new Error(`Product ${id} not found`);
    throw new Error(`Insufficient stock for product ${id}. Available: ${product.rows[0].stock}, Requested: ${quantity}`);
  }

  return result.rows[0];
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getProductsByMerchant,
  reduceStock
};