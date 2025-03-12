import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "../src/config/db.js";
import authRoutes from "../src/routes/authRoutes.js";
import productRoutes from "../src/routes/productRoutes.js";
import { apiLimiter } from "../src/middleware/rateLimitMiddleware.js";
dotenv.config();

const app = express();

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;  
