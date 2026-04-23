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