import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCompanies } from './seedCompanies.js';

dotenv.config();

/**
 * Script to test database connection and verify company data
 */
async function testDBConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');

    // Get a reference to the Company model
    const Company = mongoose.model('Company');
    
    // Check if the model exists
    if (!Company) {
      console.error('❌ Company model not found. Make sure models are properly defined.');
      process.exit(1);
    }
    
    // Check if companies exist
    const count = await Company.countDocuments();
    console.log(`Found ${count} companies in the database`);
    
    if (count === 0) {
      console.log('No companies found. Running seed script...');
      const result = await seedCompanies();
      
      if (result.success) {
        console.log('✅ Seeded companies successfully');
        
        // Verify seeding worked
        const newCount = await Company.countDocuments();
        console.log(`Now have ${newCount} companies in the database`);
        
        // List some sample companies
        const sample = await Company.find().limit(5).select('name source');
        console.log('Sample companies:', sample);
      } else {
        console.error('❌ Failed to seed companies:', result.error);
      }
    } else {
      // List a few companies as a sanity check
      console.log('Listing 5 random companies from database:');
      const sample = await Company.find().limit(5).select('name source');
      
      if (sample.length > 0) {
        console.log('Sample companies:', sample);
      } else {
        console.warn('⚠️ No companies returned from query despite count > 0');
      }
      
      // Try finding a specific company for deeper testing
      const infosys = await Company.findOne({ name: /infosys/i });
      if (infosys) {
        console.log('✅ Test query for "Infosys" successful:', infosys.name);
      } else {
        console.warn('⚠️ Could not find company "Infosys" - might need reseeding');
        
        // Add Infosys if it doesn't exist
        console.log('Attempting to seed Infosys...');
        const testCompany = {
          name: "Infosys",
          description: "Infosys is a global leader in next-generation digital services and consulting.",
          headquarters: "Bangalore, India",
          industry: "Information Technology",
          founded: "1981",
          source: "database"
        };
        
        await Company.create(testCompany);
        console.log('✅ Created Infosys test record');
      }
    }
    
    // Test query with regex
    const infoCompanies = await Company.find({ name: { $regex: /^info/i } });
    console.log(`Found ${infoCompanies.length} companies starting with 'info'`);
    
    console.log('All database tests completed successfully.');
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

testDBConnection(); 