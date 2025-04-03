const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Function to run a command and return a promise
function runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command}`);
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return reject(error);
            }
            if (stderr) console.error(`Command stderr: ${stderr}`);
            console.log(`Command stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}

// Main function to seed the database
async function seedDatabase() {
    try {
        console.log('=========================================');
        console.log('AI Placement Helper Database Seeding Tool');
        console.log('=========================================\n');

        const backendPath = path.join(__dirname, 'backend');
        
        // Check if update flag is passed
        const updateMode = process.argv.includes('--update');
        const updateFlag = updateMode ? '--update' : '';
        const skipEnhance = process.argv.includes('--no-enhance');

        // Run the seedCompanies.js script with optional update flag
        console.log(`🔄 ${updateMode ? 'Updating' : 'Seeding'} database with company information...`);
        await runCommand(`node scripts/seedCompanies.js ${updateFlag}`, backendPath);
        console.log(`✅ Database ${updateMode ? 'update' : 'seeding'} completed successfully!\n`);

        // Check if prepare-all-data.js exists (preferred method)
        const prepareAllDataPath = path.join(backendPath, 'scripts', 'prepare-all-data.js');
        const enhanceHiringDataPath = path.join(backendPath, 'scripts', 'enhance-hiring-data.js');
        
        if (!skipEnhance) {
            if (fs.existsSync(prepareAllDataPath)) {
                console.log('🔄 Running complete data preparation script...');
                await runCommand('node scripts/prepare-all-data.js', backendPath);
                console.log('✅ Complete data preparation finished successfully!\n');
            } else if (fs.existsSync(enhanceHiringDataPath)) {
                console.log('🔄 Enhancing companies with hiring process and career data...');
                await runCommand('node scripts/enhance-hiring-data.js', backendPath);
                console.log('✅ Company data enhancement completed successfully!\n');
            } else {
                console.log('⚠️ Enhanced data scripts not found. Basic company data was seeded.\n');
                console.log('   To add enhanced hiring and career data, implement the scripts:');
                console.log('   - backend/scripts/enhance-hiring-data.js');
                console.log('   - backend/scripts/prepare-all-data.js\n');
            }
        } else {
            console.log('ℹ️ Skipping data enhancement as requested with --no-enhance flag\n');
        }

        // Verify by running the test script
        console.log('🔍 Verifying database connection and data...');
        await runCommand('node scripts/test-db-connection.js', backendPath);
        console.log('✅ Database verification completed successfully!\n');

        console.log('🎉 All done! Your database is now populated with company information.');
        if (!skipEnhance) {
            console.log('Companies now have enhanced hiring process, career growth, and interview data.');
        }
        console.log('You can now start the application with:');
        console.log('- For Windows: node start-with-seed.js');
        console.log('- For development: Start backend and frontend separately\n');

    } catch (error) {
        console.error('❌ Error during database seeding:', error.message);
        console.error('Please check your MongoDB connection and try again.');
    }
}

// Print usage instructions if needed
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node seed-db.js [options]');
    console.log('Options:');
    console.log('  --update       Update existing companies with new information');
    console.log('  --no-enhance   Skip the enhancement of hiring process and career data');
    console.log('  --help, -h     Display this help message');
    process.exit(0);
}

// Run the main function
seedDatabase(); 