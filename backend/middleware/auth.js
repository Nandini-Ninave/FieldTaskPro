const jwt = require("jsonwebtoken");
const usermodel = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // FETCH USER FROM DATABASE
    const user = await usermodel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // IMPORTANT
    req.user = user;

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);

    res.status(401).json({
      message: "Authentication failed",
    });
  }
};

const adminOrEditor = (req, res, next) => {
  if (["admin", "editor"].includes(req.user.role)) return next();
  res.status(403).json({ message: "Access denied. Admin or Editor only." });
};

const adminOnly = (req, res, next) => {
  if (req.user.role === "admin") return next();
  res.status(403).json({ message: "Access denied. Admin only." });
};
module.exports = {auth, adminOrEditor, adminOnly};