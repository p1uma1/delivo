const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const authMiddleware = require("../middlewares/authMiddleware");

// All routes are protected by authMiddleware
router.use(authMiddleware);

router.get("/", merchantController.getAllMerchants);
router.get("/:id", merchantController.getMerchantById);

module.exports = router;
