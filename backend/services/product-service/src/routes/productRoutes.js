const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

// ─── Merchant Routes FIRST ─────────────────────────────
router.get("/merchants", authMiddleware, merchantController.getAllMerchants);
router.get("/merchants/:id", authMiddleware, merchantController.getMerchantById);

// ─── Product Routes ───────────────────────────────────
router.post("/", authMiddleware, checkRole(["merchant", "admin"]), productController.createProduct);
router.get("/recommended", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getRecommended);
router.get("/", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getAllProducts);
router.get("/search", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.searchProducts);
router.get("/category/:category", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getByCategory);
router.get("/merchant/me", authMiddleware, checkRole(["merchant"]), productController.getMyProducts);
router.get("/merchant/:merchantId", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getByMerchant);

// dynamic routes LAST
router.get("/:id", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getProductById);
router.put("/:id", authMiddleware, checkRole(["merchant", "admin"]), productController.updateProduct);
router.delete("/:id", authMiddleware, checkRole(["admin", "merchant"]), productController.deleteProduct);

module.exports = router;