const express = require("express");

const {
  signup,
  login,
  createBlog,
  getBlog,
  getBlogs,
  deleteBlog,
  forgotPassword,
  resetPassword,
} = require("../controllers/blogControllers");

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secret = "the secret is not a secret anymore  :)";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/blog", authMiddleware, createBlog);
router.get("/blogs", authMiddleware, getBlogs);
router.get("/userBlog", authMiddleware, getBlog);
router.delete("/blog/:blogId", authMiddleware, deleteBlog);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

module.exports = router;
