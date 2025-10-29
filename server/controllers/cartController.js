// ✅ Refactored and cleaned-up backend controllers

// ---- cartController.js ----
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const getUserIdFromToken = (req) => {
  const token = req.cookies.token;
  if (!token) throw { code: 401, message: "Unauthorized: Token missing" };
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
};

const addToCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    const itemId = req.body.itemId;
    if (!itemId)
      return res.status(400).json({ success: false, message: "Item ID is required" });

    const cartData = { ...(userData.cartData || {}) };
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.status(200).json({ success: true, message: "Added to cart", cartData });
  } catch (error) {
    console.error("Add to cart error:", error);
    const status = error.code || 500;
    res.status(status).json({ success: false, message: error.message || "Error adding to cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    const itemId = req.body.itemId;
    if (!itemId)
      return res.status(400).json({ success: false, message: "Item ID is required" });

    const cartData = { ...(userData.cartData || {}) };
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) delete cartData[itemId];
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.status(200).json({ success: true, message: "Removed from cart", cartData });
  } catch (error) {
    console.error("Remove from cart error:", error);
    const status = error.code || 500;
    res.status(status).json({ success: false, message: error.message || "Error removing from cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    const cartData = userData.cartData || {};
    res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.error("Get cart error:", error);
    const status = error.code || 500;
    res.status(status).json({ success: false, message: error.message || "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
