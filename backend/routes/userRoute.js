import express from 'express';
import { getName, getresponse, loginUser,registerUser } from '../controllers/userController.js';
import authMiddleWare from '../middleware/auth.js';
import { googleLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
//name of the user
userRouter.post("/google-login", googleLogin);

userRouter.get("/name",authMiddleWare,getName);
userRouter.post("/chat",getresponse);

export default userRouter;  