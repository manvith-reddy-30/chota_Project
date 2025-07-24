import express from "express"
import { placeOrder,verifyOrder,userOrders, listOrders, updateStatus } from "../controllers/orderController.js";
import {authMiddleware} from "../middleware/auth.js";

const orderRouter =  express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.get('/list',listOrders);
orderRouter.post("/status",updateStatus);

export default orderRouter;