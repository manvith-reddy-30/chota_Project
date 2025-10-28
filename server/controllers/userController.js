// backend/controllers/userController.js (MODIFIED)

import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// JWT token generator
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Login user (No change needed, role defaults to 'user' on registration)
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Added user role to login response for immediate client use (optional)
    res.status(200).json({ success: true, message: "Logged in successfully", role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Register user (No change needed, role defaults to 'user' in the model)
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email" });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // NEW USER automatically gets role: 'user' from the model
    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "Registered successfully", role: user.role });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// NEW CONTROLLER: Get User Role for RBAC
const getRole = async (req, res) => {
    // Requires authMiddleware to run first to set req.userId
    if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    try {
        const user = await userModel.findById(req.userId).select('role');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, role: user.role });
    } catch (error) {
        console.error("Get role error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const checkauth = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ loggedIn: true, userId: decoded.id });
  } catch (err) {
    // ... (error handling) ...
    res.status(200).json({ loggedIn: false });
  }
};


// Google login (with fallback registration)
const googleLogin = async (req, res) => {
  const { name, email } = req.body;

  try {
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    let user = await userModel.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = new userModel({ name, email, password: hashedPassword });
      user = await newUser.save();
    }

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Logged in with Google", role: user.role });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout user (No change needed)
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// AI chatbot response (No change needed)
const getresponse = async (req, res) => {
  try {
    const { prompt, cartItems, foodList } = req.body;

    const context = `
You are a helpful and professional restaurant assistant chatbot for a food ordering website.

✅ Instructions:
- Only answer food-related queries (menu, ingredients, nutrition, offers, timings).
- If the question is not food-related, respond: "I am not able to answer this question."
- Structure your reply using Markdown with:
  - Bold headings
  - Bullet points
  - Friendly and concise tone

✅ Context:
- User's current cart:
${Object.entries(cartItems || {})
  .map(([id, qty]) => {
    const item = foodList.find((f) => f._id === id);
    return item ? `- ${item.name} x${qty}` : null;
  })
  .filter(Boolean)
  .join("\n")}

- Available Menu:
${(foodList || [])
  .map((item) => `- ${item.name} (₹${item.price})`)
  .join("\n")}

Now respond to the prompt:
User: ${prompt}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(context);
    const text = result.response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("AI response error:", error);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};


export {
  loginUser,
  registerUser,
  getRole, // NEW: Export the role controller
  getresponse,
  googleLogin,
  logout,
};