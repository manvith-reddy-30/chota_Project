import express from "express"
import { addToCart,removeFromCart,getCart } from "../controllers/cartController.js"
import authMiddleWare from "../middleware/auth.js";
//import { get } from "mongoose";

const cartRouter = express.Router();

cartRouter.post("/add",authMiddleWare,addToCart);
cartRouter.post("/remove",authMiddleWare,removeFromCart);
cartRouter.post("/get",authMiddleWare,getCart);

export default cartRouter;