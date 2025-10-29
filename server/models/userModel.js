// backend/models/userModel.js (MODIFIED)

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData:{type:Object,default:{}},
    // NEW FIELD: Role for RBAC. Default to 'user'.
    role: { type: String, default: 'user' } 
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;