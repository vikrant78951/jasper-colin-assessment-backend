import User from "../models/User.js";
import Session from "../models/Session.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import bcrypt from 'bcrypt'
// Register user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, 
    });
    
    await newUser.save();

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Save session with refresh token
    const newSession = new Session({ userId: newUser._id, refreshToken });
    await newSession.save();

    // Set cookies for authentication
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    res.status(200).json({ "message": "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    debugger
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    debugger
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const users = await User.find({});
    console.log(users);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Session.create({ userId: user._id, refreshToken });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
   
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(403).json({ message: "No refresh token found" });
  }

  const session = await Session.findOne({ refreshToken });
  if (!session) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const accessToken = generateAccessToken(session.userId);
  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });

  res.status(200).json({ message: "Access token refreshed" });
};

// Logout user
export const logoutUser = async (req, res) => {
   
  const { refreshToken } = req.cookies;

  await Session.findOneAndDelete({ refreshToken });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({ message: "User logged out successfully" });
};
