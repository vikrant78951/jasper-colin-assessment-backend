import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Products.js"; 

dotenv.config();  
const products = [
  {
    name: "Wireless Headphones",
    description: "Noise-canceling over-ear headphones with deep bass.",
    price: 129.99,
    category: "Electronics",
  },
  {
    name: "Smartwatch",
    description: "A sleek smartwatch with fitness tracking and notifications.",
    price: 199.99,
    category: "Wearables",
  },
  {
    name: "Gaming Mouse",
    description: "Ergonomic RGB gaming mouse with adjustable DPI.",
    price: 49.99,
    category: "Gaming",
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches.",
    price: 89.99,
    category: "Gaming",
  },
];

 
mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Clear existing products before seeding
    await Product.deleteMany({});
    console.log("Existing products removed");

    // Insert new products
    await Product.insertMany(products);
    console.log("Product data seeded successfully");

    // Close connection
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });
