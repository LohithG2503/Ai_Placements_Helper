import express from "express";
import User from "../database_models/User.js"; // Ensure correct path
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
    
    // Debug: List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Try to find the user in any collections that contain user documents
    let user = null;
    
    // First try the expected collection through the User model
    user = await User.findOne({ email });
    
    if (!user) {
      // If not found through model, try direct collection access to find all collections with users
      console.log('User not found through model, trying direct collection access...');
      for (const collection of collections) {
        // Skip non-user collections
        if (['users', 'Users', 'user', 'User'].includes(collection.name)) {
          console.log(`Checking collection: ${collection.name}`);
          const coll = mongoose.connection.db.collection(collection.name);
          const foundUser = await coll.findOne({ email });
          if (foundUser) {
            console.log(`Found user in collection: ${collection.name}`);
            user = foundUser;
            break;
          }
        }
      }
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('User found:', user._id);

    // Verify password using bcrypt directly if the user was found in a different collection
    let isMatch;
    if (user.matchPassword) {
      // If user has matchPassword method, use it
      isMatch = await user.matchPassword(password);
    } else {
      // Otherwise use bcrypt directly
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', user._id);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
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

// Special route to recreate test user
router.post("/recreate-test-user", async (req, res) => {
  try {
    // Try to delete the user if it exists
    await mongoose.connection.db.collection('users').deleteOne({ email: "lohith2503@gmail.com" });
    
    // Create the user with the specific ID and password hash
    const result = await mongoose.connection.db.collection('users').insertOne({
      _id: new mongoose.Types.ObjectId("67d15a55d6409a20f08aacb8"),
      name: "lohith",
      email: "lohith2503@gmail.com",
      password: "$2b$10$5aaNk.kXU1m.iibu.DCM2ew9WM0.k02F0ZDnSF7C3aqLokyC0tKxO",
      passwordVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Test user recreated with specific ID and password hash');
    res.status(201).json({ message: "Test user recreated successfully", userId: "67d15a55d6409a20f08aacb8" });
  } catch (error) {
    console.error("Error recreating test user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
