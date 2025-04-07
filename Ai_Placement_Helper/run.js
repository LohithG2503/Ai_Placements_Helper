const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to open a new terminal window and run a command
function openTerminal(title, command, cwd) {
    const fullCommand = `start "${title}" cmd /k "cd ${cwd} && ${command}"`;
    spawn(fullCommand, [], { shell: true });
}

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
const llamaPath = path.join(__dirname, 'llama.cpp', 'build', 'bin', 'Release');
const modelPath = path.join(__dirname, 'models', 'Mistral-7B-Instruct-v0.3-Q4_K_M.gguf');

// Main function to orchestrate the startup process
async function startApp() {
    try {
        console.log('=========================================');
        console.log('AI Placement Helper - Unified Startup');
        console.log('=========================================\n');

        // Start LLM server first
        console.log('1. Starting LLM server...');
        if (fs.existsSync(path.join(llamaPath, 'llama-server.exe'))) {
            openTerminal('LLM Server', `llama-server.exe -m "${modelPath}" --port 8080 --host 127.0.0.1 --n-gpu-layers 95 --threads 12`, llamaPath);
            console.log('✅ LLM server terminal opened - will be available at http://localhost:8080\n');
        } else {
            console.warn('⚠️ LLM server executable not found at expected path. Skipping...\n');
        }

        // Wait for LLM server to start
        console.log('Waiting 3 seconds for LLM server to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Start backend server
        console.log('2. Starting backend server...');
        openTerminal('Backend Server', 'npm start', backendPath);
        console.log('✅ Backend terminal opened - will be available at http://localhost:5000\n');

        // Wait for backend to start
        console.log('Waiting 5 seconds for backend to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Start frontend development server
        console.log('3. Starting frontend development server...');
        openTerminal('Frontend Server', 'npm start', frontendPath);
        console.log('✅ Frontend terminal opened - will be available at http://localhost:3000\n');

        // Log completion
        console.log('\n✨ All components have been started in separate terminals.');
        console.log('You can now manage each component independently.');
        console.log('To stop the application, simply close the terminal windows.');
    } catch (error) {
        console.error('❌ Error during startup:', error.message);
    }
}

// Run the main function
startApp(); 