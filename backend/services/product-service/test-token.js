const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_ACCESS_SECRET;

if (!secret) {
  throw new Error("JWT_ACCESS_SECRET is missing in .env");
}

const token = jwt.sign(
  {
    id: 3,
    role: "merchant"
  },
  secret,
  { expiresIn: "1h" }
);

console.log(token);