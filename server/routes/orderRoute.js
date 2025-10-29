import express from "express"
import { placeOrder,verifyOrder,userOrders, listOrders, updateStatus } from "../controllers/orderController.js";
import {authMiddleware,checkRoleAdmin} from "../middleware/auth.js";

const orderRouter =  express.Router();

// User routes (only require basic authentication)
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders);

// Admin routes (require admin role access)
orderRouter.get('/list', authMiddleware, checkRoleAdmin, listOrders); // Auth + Role Check
orderRouter.post("/status", authMiddleware, checkRoleAdmin, updateStatus); // Auth + Role Check

export default orderRouter;