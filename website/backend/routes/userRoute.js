import express from 'express';
import { getName, loginUser,registerUser } from '../controllers/userController.js';
import authMiddleWare from '../middleware/auth.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
//name of the user
userRouter.get("/name",authMiddleWare,getName);

export default userRouter;  