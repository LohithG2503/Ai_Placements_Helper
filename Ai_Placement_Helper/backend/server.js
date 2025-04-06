import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables immediately
dotenv.config();

// Now import modules that might need environment variables
import companyRoutes from "./routes/companyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Check if required environment variables are set (now they should be loaded)
if (!process.env.SERP_API_KEY) {
  console.warn("SERP_API_KEY is not set in .env file. API fallbacks may not work correctly.");
} else {
  console.log("✅ SerpAPI key loaded successfully.");
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Routes
app.use("/api/company", companyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});