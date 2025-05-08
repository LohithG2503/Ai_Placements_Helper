# AI Placement Helper – Working Local Web App

A comprehensive full-stack application designed to assist job seekers with job description analysis, company research, and interview preparation. This version is fully functional locally with minimal external dependencies.

## Features

- **Job Description Analysis**
  - Extract key information from job postings
  - Identify required skills and qualifications
  - Understand responsibilities and requirements
  - Salary range analysis

- **Company Research**
  - Detailed company profiles and insights
  - Industry information and business segments
  - Culture and work environment details
  - Interview process information
  - Technologies and tech stack used

- **Interview Preparation**
  - Company-specific interview tips
  - Common interview questions
  - Required documents checklist
  - Career growth opportunities
  - Salary insights

## Tech Stack

- **Frontend**: React.js with Create React App
- **Backend**: Node.js & Express
- **Database**: MongoDB
- **Authentication**: JWT-based auth
- **Styling**: Custom CSS with glassmorphic UI

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn
- Windows OS (for included start scripts)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/LohithG2503/Project.git
   cd Project
   ```

2. Install dependencies:
   ```sh
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. Set up environment:
   Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. Start the application:
   ```sh
   node run.js
   ```
   This will launch both frontend and backend servers.

## Project Structure

```
Ai_Placement_Helper/
├── backend/               # Express.js server
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   └── services/         # Business logic
├── frontend/             # React.js client
│   ├── public/          
│   └── src/
│       ├── components/   # React components
│       ├── context/      # Context providers
│       └── lib/          # Utility functions
└── data/                 # Seed data and configs
```

## Available Scripts

- `node run.js` - Start both frontend and backend
- `npm run start:frontend` - Start React development server
- `npm run start:backend` - Start Express API server
- `node seed-db.js` - Seed the database with company data

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Create React App for the frontend boilerplate
- MongoDB Atlas for database hosting
- All contributors and testers