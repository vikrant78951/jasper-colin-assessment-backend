
import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getSession,
} from "../controllers/authController.js";
import {verifyToken} from '../middleware/authMiddleware.js'

const router = express.Router();


router.post("/register", registerUser);
router.get("/session", getSession);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", verifyToken, logoutUser);


export default router;
