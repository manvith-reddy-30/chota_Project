import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://manvithreddem:nn2mO4gS1bOGkYMo@cluster0.orq9bqu.mongodb.net/backend");
        console.log("✅ Database Connected Successfully!");
    } catch (error) {
        console.error("❌ Database Connection Failed:", error.message);
        process.exit(1);
    }
};


