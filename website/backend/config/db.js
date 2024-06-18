import mongoose from "mongoose"
import mangoose from "mongoose"

export const connectDB = async() => {
    await mongoose.connect("mongodb+srv://manvithreddem:nn2mO4gS1bOGkYMo@cluster0.orq9bqu.mongodb.net/backend").then(()=> {console.log("DB Connected")})
}


