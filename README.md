# AI Placement Helper – Dual Implementation Web App

  **A modern, full-stack application for job seekers, with both Local and Cloud LLM inference!**

---

## Features

- **Job Description Analysis**: Extracts key skills and requirements
- **Company Research**: Company profiles, interview process, and more
- **Interview Preparation**: Tips, common questions, and resources
- **Authentication**: Secure login/signup with JWT
- **Unified Startup**: One command to launch all services (backend, frontend, LLM server)

---

## Folder Structure

```
Project-3/
│
├── Local/         # Local implementation (llama.cpp)
│   └── Ai_Placement_Helper/
│       ├── backend/    # Express.js API
│       ├── frontend/   # React.js client
│       ├── data/       # Seed/config data
│       ├── models/     # LLM models (not in git, see below)
│       └── ...
│
├── Cloud/         # Cloud implementation (La Platforme)
│   └── Ai_Placement_Helper/
│       ├── backend/    # Express.js API
│       ├── frontend/   # React.js client
│       ├── data/       # Seed/config data
│       └── ...
│
├── Old Files/     # Legacy code (not maintained)
│
└── README.md      # This file
```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Windows OS

### 1. Clone the repository
```sh
git clone https://github.com/LohithG2503/Project.git
cd Project
```

### 2. Choose your implementation
- **Local**: For running everything on your machine (no cloud LLM)
- **Cloud**: For using La Platforme (cloud LLM inference)

### 3. Start the Application (Dependencies Auto-Installed!)

**No need to run `npm install` manually!**

Just run the unified startup script for your chosen implementation:

```sh
# For Local
cd Local/Ai_Placement_Helper
node run.js

# For Cloud
cd Cloud/Ai_Placement_Helper
node run.js
```

This will automatically install all backend and frontend dependencies, then launch the servers in separate terminals.

---

### 4. Environment Setup
Create a `.env` file in the backend directory (for both Local and Cloud):
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
SERP_API_KEY=your_serp_api_key
```

### 5. Model Files (Local Only)
- **Large model files are NOT stored in this repo.**
- Download the required `.gguf` model files (e.g., Mistral-7B, TinyLlama) and place them in:
  `Local/Ai_Placement_Helper/models/`
- Example sources: [Hugging Face](https://huggingface.co/), [official model providers]
- Add a `.gitkeep` file in the models folder to keep it in git if empty.

---

## Usage
- Access the frontend at [http://localhost:3000](http://localhost:3000)
- API runs at [http://localhost:5000](http://localhost:5000)
- Use the web interface to analyze job descriptions, search companies, and prepare for interviews.

---

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

---

## Troubleshooting
- Ensure MongoDB is running and accessible.
- For Local, make sure model files are present in the correct folder.
- Check terminal output for errors.
- For large model files, do not attempt to push to GitHub (use external storage).

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments
- [Create React App](https://create-react-app.dev/) for frontend boilerplate
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [llama.cpp](https://github.com/ggerganov/llama.cpp) for local LLM inference
- [La Platforme](https://platforme.ai/) for cloud LLM inference
- All contributors and testers
