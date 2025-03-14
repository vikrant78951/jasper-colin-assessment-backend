import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

let userData = {
  firstName: "Test",
  lastName: "User",
  email: "testUser@example.com",
  password: "Password123",
};
let refreshToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await User.deleteOne({ email: testUser.email });
  await mongoose.connection.close();
});

describe("Auth Routes", () => {


  test("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User registered successfully");
  });

  test("should not register a user with existing email", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  test("should login an existing user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged in successfully");
    refreshToken = res.headers["set-cookie"].find((cookie) =>
      cookie.startsWith("refreshToken")
    );
    expect(refreshToken).toBeDefined();
  });

  test("should not login with incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("should refresh access token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", [refreshToken]);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Access token refreshed");
  });

  test("should logout user", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", [refreshToken]);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged out successfully");
  });

  test("should return session data", async () => {
    await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    const sessionRes = await request(app)
      .get("/api/auth/session")
      .set("Cookie", [refreshToken]);
    expect(sessionRes.statusCode).toBe(200);
    expect(sessionRes.body.success).toBe(true);
  });
});
