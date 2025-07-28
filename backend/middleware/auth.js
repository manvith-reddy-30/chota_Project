import jwt from "jsonwebtoken";

// ✅ Middleware to protect routes by validating JWT
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ✅ Public route to check login status (e.g., for frontend auth check)
const checkauth = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ loggedIn: true, userId: decoded.id });
  } catch (err) {
    console.error("Auth check failed:", err);
    res.status(200).json({ loggedIn: false });
  }
};

export { authMiddleware, checkauth };
