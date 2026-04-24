const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

router.post("/", authMiddleware, checkRole(["merchant", "admin"]), productController.createProduct);
router.get("/", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getAllProducts);
router.get("/search", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.searchProducts);
router.get("/category/:category", authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getByCategory);
router.get("/merchant/:merchantId",  authMiddleware, checkRole(["admin", "merchant"]), productController.getByMerchant);
router.get("/:id",  authMiddleware, checkRole(["admin", "merchant", "customer"]), productController.getProductById);
router.put("/:id", authMiddleware, checkRole(["merchant", "admin"]), productController.updateProduct);
router.delete("/:id", authMiddleware, checkRole(["admin", "merchant"]), productController.deleteProduct);


module.exports = router;