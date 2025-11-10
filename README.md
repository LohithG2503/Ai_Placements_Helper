AI Placement Helper – Dual Implementation Web App

A modern, full-stack application for job seekers, featuring secure authentication and flexible LLM inference via local llama.cpp or a cloud provider.

Features
Job Description Analysis: Extracts key skills and requirements.

Company Research: Provides company profiles, interview processes, and more.

Interview Preparation: Delivers tips, common questions, and resources.

Secure Authentication: User login/signup with JWT (JSON Web Tokens).

Dual LLM Implementation:

Local: Runs inference on your own hardware using llama.cpp.

Cloud: Connects to "La Platforme" for cloud-based inference.

Unified Startup: A single command launches the entire stack (backend, frontend, LLM server).

Technology Stack
Frontend: React.js

Backend: Express.js, Node.js

Database: MongoDB (with Mongoose)

Authentication: JWT (JSON Web Tokens)

Local LLM: llama.cpp

Cloud LLM: La Platforme (or link to specific service)

Project Structure
Project-3/
│
├── Local/
│   └── Ai_Placement_Helper/
│       ├── backend/
│       ├── frontend/
│       ├── models/  (.gitignore'd, holds .gguf files)
│       └── run.js   (Master startup script)
│
├── Cloud/
│   └── Ai_Placement_Helper/
│       ├── backend/
│       ├── frontend/
│       └── run.js   (Master startup script)
│
└── README.md
Getting Started
Prerequisites
Node.js (v14 or higher)

MongoDB (A local instance or a free MongoDB Atlas string)

Windows OS (Scripts are tailored for Windows CMD)

Git

1. Clone the Repository
Bash

git clone https://github.com/LohithG2503/Project.git
cd Project
2. Choose Implementation
This repo contains two separate implementations. cd into the one you wish to run.

Bash

# Option 1: For Local LLM (requires powerful hardware)
cd Local/Ai_Placement_Helper

# Option 2: For Cloud LLM (requires API key)
cd Cloud/Ai_Placement_Helper
3.Security Configuration (Crucial!)
Before running, you must create a .env file for security.

Navigate to the backend folder: cd backend

Create a new file named .env

Copy the contents of .env.example (if present) or add the following:

Code snippet

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JSON Web Token Secret
JWT_SECRET=your_strong_random_secret_key_here

# API Key for Job/Company Search
SERP_API_KEY=your_serp_api_key

# Server Port
PORT=5000
Security Warning: NEVER use weak secrets like "password" or "your_secret_key". A secure JWT_SECRET is vital for protecting user accounts.

Generate a Strong Secret:

On WSL/Linux: openssl rand -hex 32

On PowerShell: [Convert]::ToBase64String((New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))

Copy and paste the output as your JWT_SECRET.

4. Model Files (Local Implementation Only)
The Local implementation requires LLM model files (in .gguf format), which are not included in this repository due to their large size.

Download your desired model(s) (e.g., Mistral-7B, TinyLlama) from a trusted source like Hugging Face.

Place the .gguf files inside the Local/Ai_Placement_Helper/models/ directory.

This models folder is listed in .gitignore to prevent accidentally committing large files.

5. Installation & Execution
No need to run npm install in each folder! The run.js script handles everything.

Navigate to your chosen implementation's root (e.g., Local/Ai_Placement_Helper).

Run the master script:

Bash

node run.js
This script will automatically:

Install all npm dependencies for the backend.

Install all npm dependencies for the frontend.

Launch the backend server (http://localhost:5000).

Launch the frontend development server (http://localhost:3000).

(If Local) Launch the llama.cpp server.
