const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });


const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const merchantRoutes = require("./routes/merchantRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);
app.use("/products/merchants", merchantRoutes);

app.get("/", (req, res) => {
  res.send("Product Service Running");
});

const PORT = process.env.PRODUCT_SERVICE_PORT || 3004;

// Start server only if this file is run directly, not when imported for testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Product service running on port ${PORT}`);
  });
}

module.exports = app;