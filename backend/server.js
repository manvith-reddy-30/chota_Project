import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import cookieParser from "cookie-parser";
import "dotenv/config";

// App config
const app = express();
const port = process.env.PORT || 4000;
const frontend_url = process.env.FRONTEND_URL;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [frontend_url,"http://localhost:5174","http://localhost:5173"] ,
    credentials: true,
  })
);
app.options("*", cors());

// Database connection
connectDB()

// API endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Static folder for images
app.use("/images", express.static("uploads"));

// Root route
app.get("/", (req, res) => {
  res.send("API is working ✅");
});

// Start server
app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
