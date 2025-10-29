import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected Successfully!");
    } catch (error) {
        console.error("❌ Database Connection Failed:", error.message);
        process.exit(1);
    }
};


