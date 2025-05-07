import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

// Load environment variables immediately
dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET
};

// Optional environment variables with defaults
const optionalEnvVars = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set');
  process.exit(1);
}

// Now import modules that might need environment variables
import companyRoutes from "./routes/companyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
const PORT = optionalEnvVars.PORT;

// Connect to MongoDB with secure options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Enable SSL for production environments
  ssl: process.env.NODE_ENV === 'production',
  sslValidate: process.env.NODE_ENV === 'production',
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://yourdomain.com' 
    : 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use("/api/company", companyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);

// API status endpoint that doesn't expose sensitive info
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV,
    apis: {
      serpApi: !!process.env.SERP_API_KEY,
      googleKg: !!process.env.GOOGLE_KG_API_KEY
    }
  });
});

// Debug route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Debug route to verify API is working and show all routes
app.get('/api/debug/routes', (req, res) => {
  // Get list of all registered route paths
  const routes = [];
  
  // Recursive function to extract all route paths
  const extractRoutes = (layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .join(', ').toUpperCase();
      
      routes.push(`${methods} ${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Get the base path
      let basePath = '';
      if (layer.regexp && layer.regexp.source) {
        const match = layer.regexp.source.match(/^\^\\\/([^\\]+)/);
        if (match) {
          basePath = match[1];
        }
      }
      
      layer.handle.stack.forEach(stackItem => {
        if (stackItem.route) {
          const routePath = stackItem.route.path;
          const methods = Object.keys(stackItem.route.methods)
            .filter(method => stackItem.route.methods[method])
            .join(', ').toUpperCase();
          
          routes.push(`${methods} /api/${basePath}${routePath}`);
        }
      });
    }
  };
  
  // Extract routes from main app
  app._router.stack.forEach(extractRoutes);
  
  // Return all routes as JSON
  res.json({
    server: {
      nodeVersion: process.version,
      port: PORT,
      env: process.env.NODE_ENV || 'development'
    },
    routes: routes.sort(),
    apis: {
      youtube: process.env.GOOGLE_KG_API_KEY ? 'Configured' : 'Missing',
      serpApi: process.env.SERP_API_KEY ? 'Configured' : 'Missing',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    }
  });
});

// Add a YouTube API test endpoint
app.get('/api/debug/youtube', async (req, res) => {
  try {
    const { query = 'test company culture' } = req.query;
    const API_KEY = process.env.GOOGLE_KG_API_KEY;
    
    console.log(`YouTube API test with query: "${query}"`);
    
    // Make a direct request to YouTube API
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 10,
          q: query,
          type: 'video',
          key: API_KEY,
          order: 'relevance',
          videoEmbeddable: true,
        }
      }
    );
    
    // Return stats and limited video data
    res.json({
      status: 'success',
      query: query,
      api_key_length: API_KEY ? API_KEY.length : 0,
      total_results: response.data.pageInfo?.totalResults || 0,
      results_per_page: response.data.pageInfo?.resultsPerPage || 0,
      items_count: response.data.items?.length || 0,
      first_few_items: response.data.items?.slice(0, 3).map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle
      }))
    });
  } catch (error) {
    console.error('YouTube API Test Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message,
      response: error.response?.data
    });
  }
});

// Log all registered routes for debugging
console.log('🔍 API Routes:');
console.log('- /api/company/*');
console.log('- /api/user/*');
console.log('- /api/job/*');
console.log('  - GET /api/job/youtube-search');

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});