require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Product Service Running");
});

const PORT = process.env.PORT || 5002;

// Start server only if this file is run directly, not when imported for testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Product service running on port ${PORT}`);
  });
}

module.exports = app;