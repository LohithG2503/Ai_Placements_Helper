# AI Placement Helper — Dual Implementation Web App

A modern full‑stack application for job seekers. Provides secure authentication and flexible LLM inference either locally (llama.cpp) or via a cloud provider.

---

## Key Features
- Job Description Analysis — extract key skills and requirements.
- Company Research — company profiles, interview process summaries, and more.
- Interview Preparation — tips, common questions, and curated resources.
- Secure Authentication — login/signup backed by JWT (JSON Web Tokens).
- Dual LLM Implementation:
  - Local: Run inference on your own hardware with llama.cpp.
  - Cloud: Connect to "La Platforme" for cloud-based inference.
- Unified Startup — a single command to start the entire stack (backend, frontend, and LLM server).

---

## Technology Stack
- Frontend: React.js  
- Backend: Express.js / Node.js  
- Database: MongoDB (Mongoose)  
- Authentication: JWT (JSON Web Tokens)  
- Local LLM: llama.cpp  
- Cloud LLM: La Platforme (or another cloud LLM provider)

---
## Project Structure

```
Project/
├── Cloud/
│   └── Ai_Placement_Helper/
│       ├── backend/
│       ├── frontend/
│       └── run.js         # Master startup script (cloud)
│
├── Local/
│   └── Ai_Placement_Helper/
│       ├── backend/
│       ├── frontend/
│       ├── models/        # Holds .gguf model files (gitignored)
│       └── run.js         # Master startup script (local)
│
└── README.md

```
- **backend/** — Express.js server, API, authentication, and database logic  
- **frontend/** — React.js client application  
- **models/** (Local only) — LLM model files (.gguf), not included in repo  
- **run.js** — Unified startup script for backend and frontend

Cloud and Local directories each house a self-contained implementation of the app.	
---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)  
- MongoDB (local instance or MongoDB Atlas connection string)  
- Windows OS (scripts are tailored for Windows CMD)  
- Git

### 1. Clone the repository
```bash
git clone https://github.com/LohithG2503/Project.git
cd Project
```

### 2. Choose an implementation
This repo includes two separate implementations. Change into the one you want to run:

- Local LLM (requires powerful hardware)
```bash
cd Local/Ai_Placement_Helper
```

- Cloud LLM (requires API key)
```bash
cd Cloud/Ai_Placement_Helper
```

---

## Security Configuration (Crucial)
Before running, create a `.env` file in the `backend` folder.

1. Navigate to the backend:
```bash
cd backend
```

2. Create `.env` and add the following values (or copy from `.env.example` if available):
```env
# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JSON Web Token Secret
JWT_SECRET=your_strong_random_secret_key_here

# API Key for Job/Company Search
SERP_API_KEY=your_serp_api_key

# Server Port
PORT=5000
```

Security warning: NEVER use weak secrets such as `password` or `your_secret_key`. A strong `JWT_SECRET` is essential to protect user accounts.

Generate a strong secret:
- On WSL / Linux:
```bash
openssl rand -hex 32
```
- On PowerShell:
```powershell
[Convert]::ToBase64String((New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
```
Copy the output into `JWT_SECRET`.

---

## Model Files (Local Implementation Only)
The Local implementation requires LLM model files in `.gguf` format. These files are intentionally excluded due to size.

1. Download desired model(s) (e.g., Mistral-7B, TinyLlama) from a trusted source (Hugging Face, etc.).
2. Place `.gguf` files inside:
```
Local/Ai_Placement_Helper/models/
```
Note: The `models/` folder is in `.gitignore` to avoid committing large files.

---

## Installation & Execution
You do not need to run `npm install` in each folder manually — the `run.js` master script handles setup and startup.

From the chosen implementation root (for example `Local/Ai_Placement_Helper`), run:
```bash
node run.js
```

What `run.js` does:
- Installs npm dependencies for the backend and frontend (if not already installed).
- Launches the backend server (http://localhost:5000).
- Launches the frontend development server (http://localhost:3000).
- If running the Local implementation, starts the llama.cpp server.

---

If you want further edits (e.g., add badges, screenshots, or platform-agnostic scripts), tell me what you'd like next and I’ll update the README.
