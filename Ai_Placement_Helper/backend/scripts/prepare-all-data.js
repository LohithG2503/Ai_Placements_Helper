import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute a script and log its output
function runScript(scriptName) {
  console.log(`\n========== RUNNING ${scriptName} ==========\n`);
  try {
    const output = execSync(`node ${path.join(__dirname, scriptName)}`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    console.error(`Error running ${scriptName}:`);
    console.error(error.message);
    return false;
  }
}

// Main function to run all scripts in sequence
async function prepareAllData() {
  console.log("\n===== PREPARING ALL DATABASE DATA =====\n");
  
  // Check if scripts exist before running
  const scriptsToRun = [
    'test-db-connection.js',  // First test connection
    'seedCompanies.js',       // Seed with basic company data
    'enhance-hiring-data.js'  // Enhance with complete hiring/career data
  ];
  
  // Check which scripts exist
  const availableScripts = scriptsToRun.filter(script => {
    const exists = fs.existsSync(path.join(__dirname, script));
    if (!exists) {
      console.warn(`Warning: Script ${script} not found and will be skipped.`);
    }
    return exists;
  });
  
  if (availableScripts.length === 0) {
    console.error("No data preparation scripts found in the current directory.");
    process.exit(1);
  }
  
  // Run scripts in sequence
  let success = true;
  for (const script of availableScripts) {
    const result = runScript(script);
    if (!result) {
      success = false;
      console.error(`\nScript ${script} failed. Continuing with next script...\n`);
    }
  }
  
  // Final summary
  if (success) {
    console.log("\n✅ ALL DATA PREPARATION COMPLETE! ✅");
    console.log("The database is now fully prepared with comprehensive company information.");
  } else {
    console.log("\n⚠️ DATA PREPARATION COMPLETED WITH ERRORS ⚠️");
    console.log("Some scripts encountered issues. Please check the logs above for details.");
  }
}

// Run the main function
prepareAllData().catch(err => {
  console.error("Fatal error in data preparation:", err);
  process.exit(1);
}); 