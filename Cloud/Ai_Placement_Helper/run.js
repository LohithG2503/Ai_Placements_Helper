const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Keep track of opened terminal processes
let openedProcesses = [];

// Function to open a new terminal window and run a command
function openTerminal(title, command, cwd) {
    const fullCommand = `start "${title}" cmd /k "cd ${cwd} && ${command}"`;
    const process = spawn(fullCommand, [], { shell: true });
    openedProcesses.push(process);
    return process;
}

// Function to run a command and return a promise
function runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command}`);
        const childProcess = exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return reject(error);
            }
            if (stderr) console.error(`Command stderr: ${stderr}`);
            console.log(`Command stdout: ${stdout}`);
            resolve(stdout);
        });
        openedProcesses.push(childProcess);
    });
}

// Cleanup function to handle interruption
async function cleanup() {
    console.log('\n\nCleaning up...');
    
    // Kill all opened processes
    openedProcesses.forEach(process => {
        try {
            process.kill();
        } catch (err) {
            // Ignore errors if process is already terminated
        }
    });

    // Attempt to uninstall dependencies
    try {
        console.log('Reverting backend dependencies...');
        await runCommand('npm uninstall', backendPath);
        console.log('Reverting frontend dependencies...');
        await runCommand('npm uninstall', frontendPath);
        console.log('✅ Cleanup completed successfully');
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
    }
    
    process.exit(0);
}

// Handle Ctrl+C and other termination signals
process.on('SIGINT', cleanup);  // Ctrl+C
process.on('SIGTERM', cleanup); // Kill command

// Get the absolute paths
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');
const llamaPath = path.join(__dirname, 'llama.cpp', 'build', 'bin', 'Release');
const modelPath = path.join(__dirname, 'models', 'Mistral-7B-Instruct-v0.3-Q4_K_M.gguf');

// Main function to orchestrate the startup process
async function startApp() {
    try {
        console.log('=========================================');
        console.log('AI Placement Helper - Unified Startup');
        console.log('=========================================\n');
        console.log('Press Ctrl+C at any time to cancel and revert changes\n');

        // Install backend dependencies
        console.log('1. Installing backend dependencies...');
        await runCommand('npm install', backendPath);
        console.log('✅ Backend dependencies installed\n');

        // Install MistralAI dependency for backend
        console.log('1a. Installing @mistralai/mistralai for backend...');
        await runCommand('npm install @mistralai/mistralai', backendPath);
        console.log('✅ @mistralai/mistralai installed for backend\n');

        // Install frontend dependencies
        console.log('2. Installing frontend dependencies...');
        await runCommand('npm install', frontendPath);
        console.log('✅ Frontend dependencies installed\n');

        // Start LLM server first - THIS SECTION WILL BE MODIFIED
        console.log('3. Local LLM server startup skipped (using external Mistral API).\n');
        /* // Commenting out the local LLM server startup
        console.log('3. Starting LLM server...');
        if (fs.existsSync(path.join(llamaPath, 'llama-server.exe'))) {
            openTerminal('LLM Server', `llama-server.exe -m "${modelPath}" --port 8080 --host 127.0.0.1 --n-gpu-layers 95 --threads 12`, llamaPath);
            console.log('✅ LLM server terminal opened - will be available at http://localhost:8080\n');
        } else {
            console.warn('⚠️ LLM server executable not found at expected path. Skipping...\n');
        }

        // Wait for LLM server to start
        console.log('Waiting 3 seconds for LLM server to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        */

        // Start backend server
        console.log('4. Starting backend server...');
        openTerminal('Backend Server', 'npm start', backendPath);
        console.log('✅ Backend terminal opened - will be available at http://localhost:5000\n');

        // Wait for backend to start
        console.log('Waiting 5 seconds for backend to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Start frontend development server
        console.log('5. Starting frontend development server...');
        openTerminal('Frontend Server', 'npm start', frontendPath);
        console.log('✅ Frontend terminal opened - will be available at http://localhost:3000\n');

        // Log completion
        console.log('\n✨ All components have been started in separate terminals.');
        console.log('You can now manage each component independently.');
        console.log('To stop the application, simply close the terminal windows.');
    } catch (error) {
        console.error('❌ Error during startup:', error.message);
        console.error('Please try running npm install manually in both backend and frontend directories');
    }
}

// Run the main function
startApp();