import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found", success: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Logged in successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });

    if (password.length < 8)
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "Registered successfully" });
  } catch (error) {
    console.log("Error during registration:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user name using cookie token
const getName = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await userModel.findById(decoded.id);

    if (!userData)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, userName: userData.name });
  } catch (error) {
    console.log("Error fetching user name:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Google login
const googleLogin = async (req, res) => {
  const { name, email } = req.body;

  try {
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

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
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Logged in with Google" });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully", success: true });
};

// Get AI response
const getresponse = async (req, res) => {
  try {
    const { prompt, cartItems, foodList } = req.body;

    const making_it = `
You are a helpful and professional restaurant assistant chatbot for a food ordering website.

✅ **Instructions:**
- Answer **only food-related queries** (menu items, ingredients, nutrition, offers, timings).
- You can answer foods culture and local restaurants related queries.
- If the question is **not food-related**, respond with: "I am not able to answer this question."
- Structure your response clearly using **Markdown**:
- **Bold headings**
- Short paragraphs
- Bullet points for menus or lists
- Keep tone **friendly, concise, and easy to read**

✅ **Context:**
- The user is chatting with a restaurant AI on our food website.
- Here’s their current cart:
${Object.entries(cartItems || {})
  .map(([id, qty]) => {
    const item = foodList.find((f) => f._id === id);
    return item ? `- ${item.name} x${qty}` : null;
  })
  .filter(Boolean)
  .join("\n")}

- Available Menu Items:
${(foodList || [])
  .map((item) => `- ${item.name} (₹${item.price})`)
  .join("\n")}

Now, respond to the user's prompt below:
`;

    const fullPrompt = `${making_it}\n\nUser prompt: ${prompt}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export {
  loginUser,
  registerUser,
  getName,
  getresponse,
  googleLogin,
  logout,
};
