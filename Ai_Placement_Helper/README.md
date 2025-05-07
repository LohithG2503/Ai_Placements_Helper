# AI Placement Helper – Fully Locally Working Web App

This branch provides a complete, ready-to-run local setup for the AI Placement Helper project. It includes:

- Unified startup script for backend, frontend, and LLM server (Windows)
- Node.js/Express backend with MongoDB integration
- React frontend (Create React App)
- Local authentication and job/company analysis
- No cloud dependencies required except for MongoDB (can be local or Atlas)

---

## Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm**
- **MongoDB** (local or cloud)
- **Windows OS** (for the included start scripts)

### 1. Clone the repository

```sh
git clone https://github.com/LohithG2503/Project.git
cd Project
git checkout fully-locally-working-web-app
```

### 2. Install dependencies

```sh
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the `backend` folder with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
SERP_API_KEY=your_serp_api_key
```

### 4. Start the Application

From the project root, run:

```sh
node run.js
```

This will:
- Start the LLM server (if available)
- Start the backend server (http://localhost:5000)
- Start the frontend server (http://localhost:3000)

Each will open in a new terminal window.

---

## Project Structure

- `/backend` – Node.js/Express API, MongoDB models, routes, and services
- `/frontend` – React app (Create React App), all UI components
- `/models` – LLM models (optional, for local LLM server)
- `/llama.cpp` – LLM server binaries (optional)

---

## Features

- **Job Description Analysis**: Paste a job description and get structured insights.
- **Company Info Search**: Search for companies and view detailed info.
- **Past Interviews**: Watch relevant YouTube interview videos.
- **Authentication**: Local login/signup with JWT.
- **Unified Startup**: One command to launch all services.

---

## Troubleshooting

- If the LLM server is not available, backend and frontend will still work.
- Make sure MongoDB is running and accessible.
- For any issues, check the terminal output for errors.

---

## Scripts

- `node run.js` – Unified startup (recommended)
- `npm run start:backend` – Start backend only
- `npm run start:frontend` – Start frontend only

---

## License

This project is for educational and demonstration purposes.