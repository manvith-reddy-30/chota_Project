// backend/controllers/profileController.js (NEW FILE)

import userModel from "../models/userModel.js";

// Controller to get user profile data (name, email, address, etc.)
const getUserProfile = async (req, res) => {
    // Requires authMiddleware to run first and set req.userId
    if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        // Fetch user data, but exclude sensitive fields like password
        const user = await userModel.findById(req.userId).select('name email role cartData'); 
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Structure data to match frontend's expected format (from Profile.jsx)
        // Assuming phone and address fields will be stored directly on the user model later, 
        // for now we send what's available and assume the frontend will handle empty fields.
        const userData = {
            name: user.name,
            email: user.email,
            role: user.role, // Important for RBAC on profile page
            // Assuming phone and address are also stored in userModel
            phone: user.phone || '', 
            address: user.address || '' 
        };

        res.status(200).json({ success: true, data: userData });
    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Controller to update user profile data
const updateProfile = async (req, res) => {
    // Requires authMiddleware to run first and set req.userId
    if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // Data from frontend (Profile.jsx)
    const { name, phone, address } = req.body; 

    try {
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update fields (excluding role/email/password for security)
        user.name = name;
        // NOTE: You must ensure 'phone' and 'address' fields exist in your userModel.js
        user.phone = phone; 
        user.address = address;

        await user.save();

        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export { getUserProfile, updateProfile };