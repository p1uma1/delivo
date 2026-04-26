const productService = require("../services/productService");

const createProduct = async (req, res) => {
  try {
    const data = {
      ...req.body,
      merchant_id: req.user.userId || req.user.id
    };

    const product = await productService.createProduct(data);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommended = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    // Simple logic: just return the first 5 products for now
    res.json(products.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const existingProduct = await productService.getProductById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If merchant, only update own product
    if (
      req.user.role === "merchant" &&
      existingProduct.merchant_id !== (req.user.userId || req.user.id)
    ) {
      return res.status(403).json({
        message: "You can only update your own products"
      });
    }

    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.json(updatedProduct);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existingProduct = await productService.getProductById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // merchant can delete only own product
    if (
      req.user.role === "merchant" &&
      existingProduct.merchant_id !== (req.user.userId || req.user.id)
    ) {
      return res.status(403).json({
        message: "You can only delete your own products"
      });
    }

    await productService.deleteProduct(req.params.id);

    res.json({ message: "Product deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const products = await productService.searchProducts(req.query.q || "");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByCategory = async (req, res) => {
  try {
    const products = await productService.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByMerchant = async (req, res) => {
  try {
    const products = await productService.getProductsByMerchant(req.params.merchantId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getByCategory,
  getByMerchant,
  getRecommended
};