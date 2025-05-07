import dotenv from 'dotenv';
import { seedCompanies } from './seedCompanies.js';

// Load environment variables
dotenv.config();

// Run the seeding process
async function runSeed() {
  try {
    console.log('Starting database seeding process...');
    await seedCompanies();
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

runSeed(); 