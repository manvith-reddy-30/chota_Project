import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from 'http'; // Import to create a standard HTTP server
import { WebSocketServer } from 'ws'; // Import WebSocket library
import jwt from 'jsonwebtoken';
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;
const frontend_url = process.env.FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET;
// Middlewares
app.use(express.json());
app.use(cookieParser());

// Define your allowed domains with a pattern for Netlify previews
const allowedOrigins = [
  // Local development URLs
  "http://localhost:5174", 
  "http://localhost:5173",
  
  // Production URL
  "https://cuisinecraze.netlify.app", 
  // Add the frontend_url variable if it holds the production URL
  frontend_url
];

// Function to check against allowed origins and the Netlify preview pattern
app.use(cors({
    origin: (origin, callback) => {
        // 1. Allow if the origin is one of the explicitly listed URLs
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // 2. Allow if the origin matches the Netlify Deploy Preview pattern
        // This regex matches any subdomain ending with --cuisinecraze.netlify.app
        if (origin && origin.match(/\.netlify\.app$/)) {
             return callback(null, true);
        }

        // 3. Allow requests with no origin (e.g., cURL, some mobile apps)
        if (!origin) {
            return callback(null, true);
        }

        // Block all others
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
}));

// The app.options("*", cors()); line is redundant if you use the above function 
// because the CORS middleware handles preflight requests by default when configured.

// Database connection
connectDB();

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

const httpServer = createServer(app); 

// Create the WebSocket server, attaching it to the HTTP server
const wss = new WebSocketServer({ server: httpServer });

// server.js (ADD THIS HELPER FUNCTION)
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(function(cookie) {
    let parts = cookie.split('=');
    // Trim whitespace and decode value
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

// ----------------------------------------------------
// 💡 WEBSOCKET HANDLER
// ----------------------------------------------------
// server.js (MODIFIED WEBSOCKET HANDLER)

// Map to store active user connections (userId -> ws instance)
const activeUserConnections = new Map();

wss.on('connection', function connection(ws, req) {
    let userId = null;

    try {
        // 1. Get the raw cookie header from the handshake request
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.token; // Look for the 'token' cookie

        if (!token) {
            console.log('WS Connection blocked: Token missing.');
            ws.close(1008, 'Authentication required.'); // 1008 is Policy Violation
            return;
        }

        // 2. Verify the token using your secret
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;

        // 3. Success: Attach the userId to the WebSocket instance
        ws.userId = userId;
        activeUserConnections.set(userId, ws); // Store in the map
        console.log(`WebSocket client connected. User ID: ${userId}`);

    } catch (err) {
        // Handle JWT verification failure (invalid or expired token)
        console.error('WS Connection blocked: Invalid token.', err.message);
        ws.close(1008, 'Invalid authentication token.');
        return;
    }

    // ----------------------------------------------------
    // User-specific handlers now have access to ws.userId
    // ----------------------------------------------------

    ws.on('message', function incoming(message) {
        // Example: Only authenticated users can send chat messages
        console.log(`Received message from User ${ws.userId}: ${message.toString()}`);
    });

    ws.on('close', () => {
        console.log(`WebSocket client disconnected. User ID: ${ws.userId || 'N/A'}`);
        // Remove the connection from the active map
        if (ws.userId) {
            activeUserConnections.delete(ws.userId);
        }
    });
});

export const orderUpdateForUser = (userId, message) => {
    const ws = activeUserConnections.get(userId);
    if (ws && ws.readyState === 1 /* WebSocket.OPEN */) {
        ws.send(JSON.stringify({ type: 'ORDER_UPDATE', data: message }));
    }
};

export const broadcastFoodUpdate = (message) => {
  console.log(`Attempting to broadcast Food Update to ${wss.clients.size} clients.`);
    wss.clients.forEach(function each(client) {
        if (client.readyState === 1 /* WebSocket.OPEN */) { 
            client.send(JSON.stringify({ type: 'FOOD_UPDATE', data: message }));
        }
    });
};

// ----------------------------------------------------

// Start server
httpServer.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
