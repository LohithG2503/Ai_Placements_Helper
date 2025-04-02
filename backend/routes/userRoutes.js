import express from "express";
import User from "../database_models/User.js"; // Ensure correct path
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
  try {
    console.log('Registration attempt:', new Date().toISOString());
    let { name, email, password } = req.body;

    // Validate input
    if (!email || !password || !name) {
      console.log('Missing required fields');
      return res.status(400).json({ message: "All fields are required" });
    }

    // Clean input
    email = email.toLowerCase().trim();
    password = password.trim();
    name = name.trim();

    console.log('Cleaned email:', email);
    console.log('Password length:', password.length);

    // Validate password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password explicitly
    const hashedPassword = await User.hashPassword(password);
    console.log('Password hashed successfully');

    // Create new user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      passwordVersion: 1
    });

    console.log('User created successfully:', user._id);
    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    console.log('Login attempt:', new Date().toISOString());
    let { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Clean input
    email = email.toLowerCase().trim();
    password = password.trim();

    console.log('Attempting login for email:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('User found:', user._id);

    // Verify password
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', user._id);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-fallback-secret',
      { expiresIn: "1h" }
    );

    console.log('Login successful for user:', user._id);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
