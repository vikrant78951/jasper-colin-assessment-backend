import cluster from "cluster";
import os from "os";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import {apiLimiter} from "../src/middleware/rateLimitMiddleware.js";


dotenv.config();
const numCPUs = os.cpus().length || 1; 
const isProduction = process.env.NODE_ENV === "production";

if (cluster.isPrimary && !isProduction) {

  // Fork workers (one per CPU core)
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they crash
  cluster.on("exit", (worker, code, signal) => {
   
    cluster.fork();
  });
} else {
  // Worker process runs Express server
   const app = express();
   app.use(express.json());
   app.use(apiLimiter);

  // Connect to MongoDB  
  connectDB().then(() => {
    app.use(cors());
    app.use(express.json());

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Worker ${process.pid} running on port ${PORT}`)
    );
  });
}
