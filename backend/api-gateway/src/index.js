const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// PRODUCT SERVICE ROUTE
app.use(
  "/products",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: (path) => {
      // Preserve the /products prefix expected by product-service routes.
      return `/products${path}`;
    }
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway Running");
});

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});