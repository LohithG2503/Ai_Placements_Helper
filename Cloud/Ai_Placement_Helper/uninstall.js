const { exec } = require('child_process');
const path = require('path');

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

// Get the absolute paths
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

// Main function to handle uninstallation
async function uninstallDependencies() {
    console.log('=========================================');
    console.log('AI Placement Helper - Dependency Cleanup');
    console.log('=========================================\n');

    try {
        // Remove backend dependencies
        console.log('1. Removing backend dependencies...');
        await runCommand('npm uninstall', backendPath);
        console.log('✅ Backend dependencies removed\n');

        // Remove frontend dependencies
        console.log('2. Removing frontend dependencies...');
        await runCommand('npm uninstall', frontendPath);
        console.log('✅ Frontend dependencies removed\n');

        // Clean npm cache
        console.log('3. Cleaning npm cache...');
        await runCommand('npm cache clean --force');
        console.log('✅ npm cache cleaned\n');

        console.log('✨ All dependencies have been successfully removed.');
        console.log('You can now safely delete the project or reinstall dependencies.');
    } catch (error) {
        console.error('❌ Error during uninstallation:', error.message);
        process.exit(1);
    }
}

// Run the uninstallation
uninstallDependencies();