import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import User from '../src/models/User.js'
import { connectDB } from "../src/config/db.js";
dotenv.config();

let accessToken;
let refreshToken;

const testUser = {
  firstName: "test",
  lastName: "user",
  email: "testUser@example.com",
  password: "password123",
};


beforeAll(async () => {
  await connectDB();
});

// afterAll(async () => {
//   await User.deleteOne({ email: testUser.email });
// });

afterAll(async () => {
  await User.deleteOne({ email: testUser.email });

   setTimeout(async () => {
     await mongoose.connection.close();
   }, 1000);

});



describe("Authentication API", () => {

  it.only("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  });

  it.only("should login the user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "User logged in successfully");
    accessToken = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
    refreshToken = res.headers["set-cookie"][1].split(";")[0].split("=")[1];
  });

  it("should reject login with incorrect credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email:testUser.email,
      password: "wrongpassword",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should refresh the access token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Access token refreshed");
  });

  it("should not allow unauthorized access", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("should log out the user", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `accessToken=${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "User logged out successfully");
  });
});
