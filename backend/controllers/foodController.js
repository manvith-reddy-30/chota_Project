// ✅ Refactored foodController.js
import foodModel from "../models/FoodModels.js";
import fs from "fs";
import path from "path";

// Add food item
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    }

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.file.filename,
      category: req.body.category,
    });

    await food.save();
    res
      .status(201)
      .json({ success: true, message: "Food added successfully" });
  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};

// List all food items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({}).lean(); // lean() improves read perf
    res.status(200).json({ success: true, data: foods });
  } catch (error) {
    console.error("List food error:", error);
    res.status(500).json({ success: false, message: "Error listing food" });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    const imagePath = path.join("uploads", food.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Image deletion error:", err);
    });

    await foodModel.findByIdAndDelete(req.body.id);
    res
      .status(200)
      .json({ success: true, message: "Food removed successfully" });
  } catch (error) {
    console.error("Remove food error:", error);
    res.status(500).json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };
