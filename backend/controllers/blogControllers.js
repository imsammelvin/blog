const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Blog = require("../models/blog");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const secret = "the secret is not a secret anymore  :)";
const emailId = "sammelvin2232002@gmail.com";
const emailPassword = "oslztnqpxykbysst";
const BASE_URL = "http://localhost:3001/api";

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ sub: user._id }, secret);
    const id = user._id;
    res.json({ token, id });
  } catch (error) {
    res.status(400).json({ message: "Could not create user" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error();
    }
    const token = jwt.sign({ sub: user._id }, secret);
    const id = user._id;
    res.json({ token, id });
  } catch (error) {
    res.status(400).json({ message: "Invalid email or password" });
  }
};

const createBlog = async (req, res) => {
  const { title, content } = req.body;
  username = req.user.name;
  try {
    const blog = await Blog.create({
      title,
      content,
      username,
      author: req.user._id,
    });
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: "Could not create blog post" });
  }
};

const getBlog = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const blogs = await Blog.find({ author: userId });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({
      _id: -1,
    });
    res.json(blogs);
  } catch (error) {
    res.status(404).json({ message: "Blogs not found" });
  }
};

const deleteBlog = async (req, res) => {
  const { blogId } = req.params;
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error();
    }
    await blog.remove();
    res.json({ message: "Blog deleted" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete blog" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // Expires in 1 hour
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailId,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: emailId,
      to: email,
      subject: "Reset Password",
      html: `
        <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link or paste this into your browser to complete the process:</p>
        <p>${BASE_URL}/reset-password/${resetToken}</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset password instructions sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Could not reset password" });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reset token" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not reset password" });
  }
};

module.exports = {
  signup,
  login,
  createBlog,
  getBlog,
  getBlogs,
  deleteBlog,
  forgotPassword,
  resetPassword,
};
