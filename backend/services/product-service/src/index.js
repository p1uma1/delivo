const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Product Service Running");
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});