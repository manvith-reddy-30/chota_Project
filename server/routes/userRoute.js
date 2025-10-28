// backend/routes/userRoute.js (EXAMPLE MODIFICATION)

import express from 'express';
// Import the new controller and middleware
import { loginUser, registerUser, googleLogin, logout, getresponse, getRole } from '../controllers/userController.js';
import { authMiddleware, checkauth } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-login", googleLogin);
userRouter.get("/logout", logout);

// EXISTING: Check if user is authenticated (used by client)
userRouter.get("/check-auth", checkauth); 

// NEW ROUTE: Fetch the user's role, secured by authMiddleware
userRouter.get("/role", authMiddleware, getRole); 

// EXISTING: AI Chatbot (might need authMiddleware if it uses user context)
userRouter.post("/chat", getresponse); 

export default userRouter;