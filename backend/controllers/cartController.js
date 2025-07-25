import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};

    const itemId = req.body.itemId;
    if (!itemId)
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });

    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.status(200).json({ success: true, message: "Added to cart", cartData });
  } catch (error) {
    console.log("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};
    const itemId = req.body.itemId;
    if (!itemId)
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.status(200).json({ success: true, message: "Removed from cart", cartData });
  } catch (error) {
    console.log("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};
    res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.log("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
