import jwt from "jsonwebtoken";
import Session from "../models/Session.js";  
import { generateAccessToken } from "../utils/token.js";  

export const verifyToken = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

     if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
        req.user = decoded; 
        return next();
      } catch (error) {
        console.log("Access token expired:", error.message);
      }
    }

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    let decodedRefresh;
    try {
      decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(decodedRefresh.userId);
    res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true });

    req.user = { userId: decodedRefresh.userId };

    next();  
  } catch (error) {
    console.error("Error in verifyToken middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
