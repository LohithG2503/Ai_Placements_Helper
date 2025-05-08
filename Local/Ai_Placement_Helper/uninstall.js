const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises; // Use promises version of fs

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

// Function to remove a directory recursively
async function removeDirectory(dirPath) {
    console.log(`Attempting to remove directory: ${dirPath}`);
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`Successfully removed directory: ${dirPath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Directory not found, skipping: ${dirPath}`);
        } else {
            console.error(`Error removing directory ${dirPath}:`, error);
            throw error; // Re-throw other errors
        }
    }
}

// Get the absolute paths
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');
const backendNodeModules = path.join(backendPath, 'node_modules');
const frontendNodeModules = path.join(frontendPath, 'node_modules');

// Main function to handle uninstallation
async function cleanupProject() {
    console.log('=========================================');
    console.log('AI Placement Helper - Project Cleanup');
    console.log('=========================================\n');

    try {
        // Remove backend node_modules
        console.log('1. Removing backend node_modules...');
        await removeDirectory(backendNodeModules);
        console.log('✅ Backend node_modules removed (if existed)\n');

        // Remove frontend node_modules
        console.log('2. Removing frontend node_modules...');
        await removeDirectory(frontendNodeModules);
        console.log('✅ Frontend node_modules removed (if existed)\n');

        // Clean npm cache (optional, but often helpful)
        console.log('3. Cleaning npm cache...');
        try {
            await runCommand('npm cache clean --force', __dirname); // Run in root
            console.log('✅ npm cache cleaned\n');
        } catch (cacheError) {
            console.warn('⚠️ Could not clean npm cache:', cacheError.message);
            console.warn('(This is often not critical)\n');
        }

        console.log('✨ Project cleanup complete.');
        console.log('node_modules folders removed. You may also want to manually delete package-lock.json files.');
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
}

// Run the cleanup
cleanupProject();