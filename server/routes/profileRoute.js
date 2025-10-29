// backend/routes/profileRoute.js (NEW FILE)

import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getUserProfile, updateProfile } from "../controllers/profileController.js";

const profileRouter = express.Router();

// Publicly exposed endpoints for this route are not needed; all are protected.

// GET /api/profile/get - Protected route to fetch user profile
profileRouter.get("/get", authMiddleware, getUserProfile); 

// POST /api/profile/update - Protected route to update user profile
profileRouter.post("/update", authMiddleware, updateProfile); 

export default profileRouter;