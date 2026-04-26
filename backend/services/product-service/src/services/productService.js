const productRepository = require("../repositories/productRepository");

const createProduct = async (data) => {
  return await productRepository.createProduct(data);
};

const getAllProducts = async () => {
  return await productRepository.getAllProducts();
};

const getProductById = async (id) => {
  return await productRepository.getProductById(id);
};

const updateProduct = async (id, data) => {
  return await productRepository.updateProduct(id, data);
};

const deleteProduct = async (id) => {
  return await productRepository.deleteProduct(id);
};

const searchProducts = async (query) => {
  return await productRepository.searchProducts(query);
};

const getProductsByCategory = async (category) => {
  return await productRepository.getProductsByCategory(category);
};

const getProductsByMerchant = async (merchantId) => {
  return await productRepository.getProductsByMerchant(merchantId);
};

const reserveStock = async (items) => {
  const pool = require("../db/db");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      if (item.productId) {
        const result = await client.query(
          "UPDATE products SET stock = stock - $2 WHERE id = $1 AND stock >= $2 RETURNING *",
          [item.productId, item.quantity]
        );
        if (result.rowCount === 0) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
  reserveStock
};