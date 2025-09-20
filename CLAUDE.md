# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
教师评价平台 (Teacher Evaluation Platform) - A modern teacher evaluation system showcasing comprehensive performance across teaching, research, service, and professional development. Uses a separated frontend/backend architecture with intuitive data visualization.

## Architecture

### Tech Stack
- **Frontend**: React 19.1.1 + Vite 7.1.6 + TailwindCSS 4.1.13 + Chart.js + React Router DOM
- **Backend**: Node.js + Express 5.1.0 + SQLite3 5.1.7 + CORS
- **Database**: SQLite (7 core tables: teachers, courses, student_evaluations, research_outputs, service_contributions, professional_development, career_history)

### Project Structure
```
教师服务后台/
├── frontend/               # React SPA application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # Base UI components (Button, Card, Modal, etc.)
│   │   │   └── layout/    # Layout components (Header, Sidebar, Layout)
│   │   ├── pages/         # Route-based page components
│   │   └── App.jsx        # Main routing configuration
│   └── vite.config.js     # Vite build configuration
├── backend/               # Express API server
│   ├── routes/            # API route handlers (auth, teachers, evaluations, analytics, schoolday)
│   ├── config/            # Database config and seed data
│   │   ├── database.js    # SQLite database initialization
│   │   ├── seedData.js    # Demo data seeding
│   │   └── schooldayMockData.js # Schoolday integration mock data
│   └── server.js          # Express server setup
└── database/              # SQLite database files
```

### Key Architecture Patterns
- **Frontend**: React Router for SPA routing, component-based architecture with UI library in `components/ui/`
- **Backend**: Express REST API with modular route organization, SQLite with class-based database wrapper
- **Data Flow**: Frontend pages → API endpoints → SQLite database with mock Schoolday integration
- **Styling**: TailwindCSS with custom purple-blue theme configuration
- **Development**: Vite for fast HMR, ESLint for code quality

## Development Commands

### Frontend (React + Vite)
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Express)
```bash
cd backend
npm install          # Install dependencies
npm start            # Start server (http://localhost:3001)
npm run dev          # Start server (same as start)
```

### Database
- SQLite database automatically initializes on first backend startup
- Database file: `database/teacher_evaluation.db`
- Seed data automatically inserted on initialization
- Health check: `GET http://localhost:3001/health`

## API Architecture

### Main Endpoints
- `/api/auth` - Authentication system (includes Schoolday OAuth2 integration)
- `/api/teachers` - Teacher information management
- `/api/evaluations` - Student evaluation data
- `/api/analytics` - Data analysis and statistics
- `/api/schoolday` - Schoolday platform integration mock

### Database Schema
Core tables: teachers, courses, student_evaluations, research_outputs, service_contributions, professional_development, career_history. See `backend/config/database.js` for complete schema definitions.

## Frontend Architecture

### Page Components
- `/` - Overview (Performance dashboard with charts)
- `/teaching` - Teaching Performance
- `/research` - Research Portfolio
- `/service` - Service Portfolio
- `/professional` - Professional Development
- `/career` - Career Journey

### Component Organization
- `components/ui/` - Reusable UI components (Button, Card, Modal, Table, etc.)
- `components/layout/` - Layout structure (Header, Sidebar, Layout wrapper)
- All components are functional React components using modern React patterns

### Styling System
- TailwindCSS 4.x with custom color palette (primary purple-blue theme)
- Responsive design with mobile-first approach
- Custom theme extends in `tailwind.config.js`

## Running Services
Default ports:
- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Database: SQLite file-based, no separate server needed

## Development Notes
- Frontend uses ES modules (`"type": "module"` in package.json)
- Backend uses CommonJS modules (require/module.exports)
- Both frontend and backend have separate package.json files and dependency management
- Database automatically seeds with demo data including mock Schoolday integration data
- No test framework currently configured (backend package.json has placeholder test script)