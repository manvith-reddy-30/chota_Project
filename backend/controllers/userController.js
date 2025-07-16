import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("Invalid credentials");
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);

        res.status(200).json({ success: true, token });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


//create token
const createToken = (id) => {
    const expiresIn = 45 * 60;
    return jwt.sign({id}, process.env.JWT_SECRET);
}

//register user
const registerUser = async (req,res) => {
    const {name, email, password} = req.body;
    try {
        //check if user already exists
        const exists = await userModel.findOne({email})
        if (exists) {
            return res.json({success:false,message: "User already exists"})
        }
        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    } catch (error) {
        console.log("Error during registration:", error);
        res.json({success:false,message:"Error"})
    }
}

const getName = async (req,res) => {
    try {
        const userId = req.body.userId;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userName = userData.name;
        res.json({ success: true, userName });
    } catch (error) {
        console.log("Error fetching user name:", error);
        res.json({success:false,message:"Error"})
    }
}
const googleLogin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new userModel({ name, email, password: hashedPassword });
            user = await newUser.save();
        }

        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getresponse = async (req, res) => {
    try {
        const { prompt, cartItems, foodList, token } = req.body;


        const making_it = `
                You are a helpful and professional restaurant assistant chatbot for a food ordering website.

                ✅ **Instructions:**
                - Answer **only food-related queries** (menu items, ingredients, nutrition, offers, timings).
                - You can answer foods culture and local restuarants related queries.
                - If the question is **not food-related**, respond with: "I am not able to answer this question."
                - Structure your response clearly using **Markdown**:
                - **Bold headings**
                - Short paragraphs
                - Bullet points for menus or lists
                - Keep tone **friendly, concise, and easy to read**

                ✅ **Context:**
                - The user is chatting with a restaurant AI on our food website.
                - Here’s their current cart:
                ${Object.entries(cartItems || {}).map(([id, qty]) => {
                const item = foodList.find(f => f._id === id);
                return item ? `- ${item.name} x${qty}` : null;
                }).filter(Boolean).join('\n')}

                - Available Menu Items:
                ${(foodList || []).map(item => `- ${item.name} (₹${item.price})`).join('\n')}

                Now, respond to the user's prompt below:
                `;


        const fullPrompt = `${making_it}\n\nUser prompt: ${prompt}`;



        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        let text = response.text();

        // text = text
        //     .trim() // Remove leading and trailing whitespace
        //     .replace(/\*\*([^*]+)\*\*/g, '\n\n$1\n\n') // Add line breaks around bold headings
        //     .replace(/\*\s/g, '\n- ') // Convert bullet points into list format
        //     .replace(/\n{3,}/g, '\n\n') // Ensure no excessive line breaks
        //     .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        //     .replace(/(^\w|\.\s*\w)/g, match => match.toUpperCase()); // Capitalize the first letter of sentences
        res.json({ response: text });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
};

export {loginUser, registerUser, getName ,getresponse,googleLogin}
