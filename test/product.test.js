import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";


dotenv.config();
let productId; 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Product API", () => {
  
  it("should fetch all product", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Products fetched successfully");
  });

  it("should create new product", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ name: "samsung 1", description: "Smartphone", price: 699 , category : "phone"});
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Product created successfully");
    expect(res.body.data).toHaveProperty("_id"); 
    productId = res.body.data._id;
  });

    it("should fetch product by id", async () => {
      const res = await request(app)
        .get("/api/products/"+productId)
      expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
        "message",
        "Product fetch successfully"
      );
      expect(res.body.data).toHaveProperty("_id");
      productId = res.body.data._id;
    });

  it("should update product", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ name: "Phone", description: "New Smartphone", price: 100 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Product updated successfully");
  });

  it("should delete the product", async () => {
    const res = await request(app).delete(`/api/products/${productId}`); 

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "message",
      "Product deleted successfully"
    );
  });

});
