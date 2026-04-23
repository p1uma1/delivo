const pool = require("../db/db");

const createProduct = async (data) => {
  const { name, description, price, category, stock, merchant_id } = data;

  const result = await pool.query(
    `INSERT INTO products 
    (name, description, price, category, stock, merchant_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [name, description, price, category, stock, merchant_id]
  );

  return result.rows[0];
};

const getAllProducts = async () => {
  const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

const updateProduct = async (id, data) => {
  const { name, description, price, category, stock } = data;

  const result = await pool.query(
    `UPDATE products 
     SET name=$1, description=$2, price=$3, category=$4, stock=$5
     WHERE id=$6 RETURNING *`,
    [name, description, price, category, stock, id]
  );

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
    "SELECT * FROM products WHERE name ILIKE $1",
    [`%${query}%`]
  );

  return result.rows;
};

const getProductsByCategory = async (category) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE category = $1 ORDER BY id DESC",
    [category]
  );

  return result.rows;
};

const getProductsByMerchant = async (merchantId) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE merchant_id = $1 ORDER BY id DESC",
    [merchantId]
  );

  return result.rows;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getProductsByMerchant
};