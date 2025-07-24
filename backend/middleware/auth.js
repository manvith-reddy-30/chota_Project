import jwt from "jsonwebtoken";

// Middleware to protect routes and set req.userId
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log("Invalid token:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Route for checking auth status without protecting route
const checkauth = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, userId: decoded.id });
  } catch (err) {
    console.log("Auth check failed:", err);
    res.json({ loggedIn: false });
  }
};

export { authMiddleware, checkauth };
