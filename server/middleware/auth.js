// backend/middleware/auth.js (FINAL MODIFIED)

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // <-- NEW: Import user model

// ✅ Middleware to protect routes by validating JWT
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user ID to the request
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ✅ Public route to check login status (e.g., for frontend auth check)
const checkauth = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ loggedIn: true, userId: decoded.id });
  } catch (err) {
    console.error("Auth check failed:", err);
    res.status(200).json({ loggedIn: false });
  }
};

// 🛑 NEW MIDDLEWARE: Check if the authenticated user has the 'admin' role
const checkRoleAdmin = async (req, res, next) => {
    // Requires authMiddleware to have run first and set req.userId
    if (!req.userId) {
        // If authMiddleware failed to run or token was missing, this should already be handled by authMiddleware.
        // But this is a safety check.
        return res.status(403).json({ success: false, message: "Forbidden: Authentication required" });
    }
    
    try {
        const user = await userModel.findById(req.userId).select('role');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
        }
        
        // Role check passed
        next();
    } catch (err) {
        console.error("Admin role check failed:", err);
        return res.status(500).json({ success: false, message: "Server error during role verification" });
    }
};


export { authMiddleware, checkauth, checkRoleAdmin };