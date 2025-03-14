import cluster from "cluster";
import os from "os";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import {apiLimiter} from "../src/middleware/rateLimitMiddleware.js";
import cookieParser from "cookie-parser";


dotenv.config();
const numCPUs = os.cpus().length || 1; 
const isProduction = process.env.NODE_ENV === "production";
const whitelist = ["http://localhost:3000", "https://jca-taupe.vercel.app"];
 const corsOptions = {
   origin: function (origin, callback) {
     if (!origin || whitelist.includes(origin)) {
       callback(null, true);
     } else {
       callback(new Error("Not allowed by CORS"));
     }
   },
   credentials: true, 
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allowedHeaders: [
     "Origin",
     "X-Requested-With",
     "Content-Type",
     "Accept",
     "Authorization",
   ],
 };


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
   app.use(express.json());
  app.use(cookieParser());
  // Apply CORS middleware before routes
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // Connect to MongoDB
  connectDB().then(() => {
   
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
