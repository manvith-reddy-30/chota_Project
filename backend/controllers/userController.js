import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

//login user
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email})

        if(!user){
            console.log("User not found");
            return res.json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            console.log("Invalid credentials");
            return res.status(404).json({msg: "Invalid credentials"})
        }
        const token = createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log("Error during login:", error);
        res.json({success:false,message:"Error"})
    }
}

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

const getresponse = async (req, res) => {
    try {
        const { prompt } = req.body;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        text = text
            .trim() // Remove leading and trailing whitespace
            .replace(/\*\*([^*]+)\*\*/g, '\n\n$1\n\n') // Add line breaks around bold headings
            .replace(/\*\s/g, '\n- ') // Convert bullet points into list format
            .replace(/\n{3,}/g, '\n\n') // Ensure no excessive line breaks
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .replace(/(^\w|\.\s*\w)/g, match => match.toUpperCase()); // Capitalize the first letter of sentences
        res.json({ response: text });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
};

export {loginUser, registerUser, getName ,getresponse}
