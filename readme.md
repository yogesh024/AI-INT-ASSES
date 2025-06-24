# AI Recruitment Platform

A simple AI-powered platform to help job seekers practice interviews and take skill assessments.

## What it does

Upload your resume and job description, then choose:
- **Assessment** - Take a quiz and get feedback
- **Interview** - Chat with an AI interviewer and get feedback

## Setup

**You need:**
- Node.js installed
- OpenAI API key

**Steps:**

1. Clone the project
2. Install dependencies:
   ```bash
   # Backend
   cd interview-backend
   npm install
   
   # Frontend  
   cd frontend
   npm install
   ```

3. Add your OpenAI API key to `.env` file in backend folder:
   ```
   OPENAI_API_KEY=your_key_here,
   PORT=your_port,
   CORS_ORIGIN=*
    FRONTEND_URL=http://localhost:3000
   ```
   And in Frontend .env file add:
   ```
   REACT_APP_BACKEND_URL=your_backend_url

   ```


4. Start the servers:
   ```bash
   # Backend (run first)
   cd backend
   npm start
   
   # Frontend (in new terminal)
   cd frontend  
   npm start
   ```

5. Open http://localhost:3000

## Tech Stack

- Frontend: React.js (runs on http://localhost:3000)
- Backend: Node.js (runs on http://localhost:3001)  
- AI: OpenAI API
# chapter-recruitement
