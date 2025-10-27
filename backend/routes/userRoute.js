import express from 'express';
import { getName, getresponse, loginUser,registerUser,logout } from '../controllers/userController.js';
import { authMiddleware, checkauth } from '../middleware/auth.js';
import { googleLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
//name of the user
userRouter.post("/google-login", googleLogin);

userRouter.get("/name",authMiddleware,getName);
userRouter.post("/chat",getresponse);

userRouter.get("/check-auth",checkauth);

userRouter.get("/logout",logout)
export default userRouter;  