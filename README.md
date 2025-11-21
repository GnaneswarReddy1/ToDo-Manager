# ToDo-Manager
# SmartToDo - AI-Powered Task Manager

A full-stack web application that combines traditional task management with AI-powered natural language processing for intuitive task creation.

## Live Deployment

**Frontend on Versel**: https://to-do-manager-scak.vercel.app  
**Backend on Render**: https://todo-manager-gor6.onrender.com

## Overview

SmartToDo is a modern task management application that allows users to create, organize, and manage their tasks through both traditional forms and AI-powered natural language input. The application features voice-to-text capabilities, intelligent task parsing, and a clean, responsive interface.

## Features

### Core Functionality
- **User Authentication** - Secure signup/login with JWT tokens
- **Task CRUD Operations** - Create, read, update, delete tasks
- **Task Organization** - Separate views for active and completed tasks
- **Advanced Filtering** - Search by text, filter by tags, sort by due date
- **Priority System** - Low, medium, high priority levels
- **Tag System** - Categorize tasks with colored tags (Work, Personal, Urgent, etc.)

### AI-Powered Features
- **Natural Language Processing** - Convert spoken or typed natural language into structured tasks
- **Voice-to-Text** - Speech recognition for hands-free task creation
- **Intelligent Parsing** - Extracts dates, times, priorities, and categories from text
- **Smart Title Generation** - AI creates concise task titles from verbose input
- **Date/Time Recognition** - Understands "tomorrow", "next Friday", "at 3 PM", etc.

### User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Updates** - Instant task status changes
- **Intuitive Interface** - Clean, modern UI with smooth animations
- **Persistent Sessions** - Remember me functionality

## Technology Stack

### Frontend
- **React** - UI framework with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Web Speech API** - Voice recognition
- **CSS3** - Custom styling with CSS variables for theming
- **Chrono-node** - Natural language date parsing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **OpenAI API** - AI-powered text processing
- **CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Frontend and backend hosting
- **MongoDB Atlas** - Cloud database

## Architecture Decisions

### Frontend Structure
- **Component-Based Architecture** - Reusable, maintainable components
- **Centralized State Management** - React hooks for local state
- **API Abstraction Layer** - Clean separation between UI and data layer
- **Responsive CSS** - Mobile-first design approach

### Backend Design
- **RESTful API** - Clear endpoint structure
- **Middleware Pattern** - Authentication and error handling
- **MVC Architecture** - Models, routes, and controllers separation
- **Environment Configuration** - Secure credential management

### Database Schema
- **User Collection** - name, email, passwordHash, createdAt
- **Task Collection** - title, notes, dueDate, priority, tags, completed, userId

## AI Integration

### Where AI Was Used

1. **OpenAI GPT-4o-mini** - For generating clean, concise task titles from natural language input
2. **Chrono-node Library** - For parsing natural language dates and times
3. **Web Speech API** - For voice-to-text conversion
4. **Intelligent Fallback Parser** - Custom algorithm for date/time extraction when AI is unavailable

### AI Implementation Approach
- **Layered Processing** - Chrono for dates → OpenAI for titles → Custom logic for priorities/tags
- **Graceful Degradation** - Falls back to client-side parsing if AI service fails
- **Context-Aware** - Understands temporal references and common task patterns


# How I Deployed SmartToDo
## Backend Deployment on Render

1. **First, I prepared my repository structure:**
   - All backend files in `/backend` folder
   - All frontend files in `/frontend` folder 
   - Made sure both had their own `package.json`

2. **Deployed backend to Render:**
   - Went to [render.com](https://render.com)
   - Created a new "Web Service"
   - Connected my GitHub repository
   - Set the **Root Directory** to `backend`
   - Configured the build commands:
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
   - Added these environment variables:
     ```
     MONGODB_URI=mongodb_connection_string
     JWT_SECRET=my_super_secret_jwt_key_here
     OPENAI_API_KEY=my_openai_api_key_here
     ```
   - Clicked "Create Web Service" and waited for deployment
   - Got my backend live URL: `https://todo-manager-gor6.onrender.com`

3. **Deployed frontend to Vercel:**
   - Went to [vercel.com](https://vercel.com)
   - Created a new project and connected my GitHub repo
   - Set the **Root Directory** to `frontend`
   - Added this environment variable:
     ```
     REACT_APP_API_BASE=https://todo-manager-gor6.onrender.com/api
     ```
   - Clicked "Deploy" and Vercel automatically built and deployed
   - Got my frontend live URL: `https://to-do-manager-scak.vercel.app`

## Deployment Complete!
That's how I deployed the full-stack application:
- **Frontend**: Hosted on Vercel at `https://to-do-manager-scak.vercel.app/app`
- **Backend**: Hosted on Render at `https://todo-manager-gor6.onrender.com`
- **Database**: MongoDB Atlas (cloud database)

The entire process took about 15-20 minutes and both services were live and working together! 🎉

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- OpenAI API key (for full AI functionality)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-todo
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb_connection_string
JWT_SECRET=jwt_secret_key
OPENAI_API_KEY=openai_api_key
PORT=4000
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_BASE=http://localhost:4000/api
```

4. **Run the application**
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)  
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Project Structure

```
smart-todo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── QuickAdd.js
│   │   │   ├── TaskList.js
│   │   │   ├── TaskEditor.js
│   │   │   ├── AIPreviewModal.js
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   ├── api.js
│   │   └── App.js
│   └── public/
└── backend/
    ├── config/
    │   └── db.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── User.js
    │   └── Task.js
    ├── routes/
    │   ├── auth.js
    │   ├── tasks.js
    │   └── ai.js
    └── server.js
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get user's tasks (with optional search/filter)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### AI Features
- `POST /api/ai/parse` - Parse natural language into task structure

## What I Accomplished

### Completed Features
**Full Authentication System** - Secure signup/login with JWT  
**Complete CRUD Operations** - Create, read, update, delete tasks  
**Advanced Task Management** - Priority levels, tags, due dates  
**AI-Powered Task Creation** - Natural language parsing with OpenAI  
**Voice Input** - Speech-to-text for hands-free task entry  
**Smart Filtering** - Search, tag filters, date sorting  
**Responsive Design** - Mobile-friendly interface  
**Production Deployment** - Full-stack deployment on Vercel  
**Error Handling** - Graceful degradation and user feedback  

### AI Integration Progress
I successfully implemented a **partial AI integration** for task parsing. The current implementation:
- Uses OpenAI GPT-4o-mini for title generation
- Leverages Chrono-node for date/time parsing
- Includes a robust fallback parser for when AI services are unavailable
- Provides voice input capabilities through Web Speech API

However, the AI integration is currently **passed in bits and pieces** - meaning while the individual components work, they could be more tightly integrated and optimized.

## If I Had More Time

### Enhanced AI Integration
- **Complete end-to-end AI parsing** with better error handling and retry logic
- **Smart task categorization** using AI to automatically assign relevant tags
- **Priority prediction** based on task content and context
- **Time estimation** for task duration using AI analysis

### Additional Features
- **Task templates** for recurring tasks
- **Collaboration features** - shared tasks and team workspaces
- **Advanced analytics** - productivity insights and time tracking
- **Calendar integration** - sync with Google Calendar/Outlook
- **Mobile app** - React Native version
- **Offline support** - PWA capabilities with sync

### Technical Improvements
- **Real-time updates** with WebSockets for live collaboration
- **Advanced caching** with Redis for better performance
- **Comprehensive testing** - unit, integration, and E2E tests
- **Performance optimization** - lazy loading, code splitting
- **Enhanced security** - rate limiting, input sanitization


## Conclusion

SmartToDo demonstrates a modern full-stack application with meaningful AI integration. It showcases clean architecture, responsive design, and practical features that enhance user productivity. The application successfully balances traditional task management with innovative AI capabilities, providing a foundation that could be extended into a comprehensive productivity platform.

The 48-hour timeframe allowed for a solid implementation of core features while leaving room for the enhanced AI integration and additional polish that would make this a production-ready application.


