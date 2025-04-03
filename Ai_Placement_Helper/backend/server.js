import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import companyRoutes from "./routes/companyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Check if required environment variables are set
if (!process.env.SERP_API_KEY) {
  console.warn("SERP_API_KEY is not set in .env file. API fallbacks may not work correctly.");
} else {
  console.log("SerpAPI key configured from environment variables");
}

// Custom logging format
const logError = (error, context) => {
  console.error(`❌ [${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

const logSuccess = (message, data) => {
  console.log(`✅ ${message}`, {
    timestamp: new Date().toISOString(),
    data: data
  });
};

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Custom response handler middleware to avoid 204 errors
app.use((req, res, next) => {
  // Store the original res.send function
  const originalSend = res.send;
  
  // Override the res.send function
  res.send = function(body) {
    // If the body is empty or undefined and status would be 204, change to 200 with empty object
    if ((!body || Object.keys(body).length === 0) && res.statusCode === 204) {
      res.status(200);
      return originalSend.call(this, JSON.stringify({ success: false, error: "No content available" }));
    }
    
    // Regular behavior
    return originalSend.call(this, body);
  };
  
  // Continue to the next middleware
  next();
});

// Routes
app.use("/api/company", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not set in .env file!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
    
    // Seed the database with initial data if it's empty
    const Company = mongoose.model('Company');
    const companyCount = await Company.countDocuments();
    
    if (companyCount === 0) {
      console.log("No companies found in database. Running seed script...");
      try {
        // Import the seedCompanies function
        const { seedCompanies } = await import('./scripts/seedCompanies.js');
        const result = await seedCompanies();
        
        if (result.success) {
          console.log("Initial company data seeded successfully!");
        } else {
          console.warn("Warning: Failed to seed initial company data:", result.error);
        }
      } catch (seedError) {
        console.warn("Warning: Failed to import or run seed script:", seedError.message);
      }
    } else {
      console.log(`Database already contains ${companyCount} companies.`);
    }
  } catch (error) {
    logError(error, "MongoDB Connection");
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  logError(err, 'Server Error');
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`
🚀 Server Status:
- Port: ${PORT}
- Environment: ${process.env.NODE_ENV || 'development'}
- Start Time: ${new Date().toISOString()}
    `);
  });
};

startServer();

export { logError, logSuccess };