# LTI - Talent Tracking System | Project Overview

## Project Description

LTI (Talent Tracking System) is a full-stack application designed for managing the complete recruitment and talent tracking process. The system features a React frontend and an Express backend using Prisma as ORM with PostgreSQL database.

## Architecture

### Technology Stack

**Backend:**
- Node.js with Express framework
- TypeScript for type safety
- Prisma ORM for database management
- PostgreSQL database
- Multer for file uploads (CV handling)
- Swagger for API documentation

**Frontend:**
- React 18 with TypeScript
- Bootstrap 5 for UI components
- React Router for navigation
- React Bootstrap Icons
- React Datepicker for date handling

**Database & Infrastructure:**
- PostgreSQL running in Docker container
- Docker Compose for service orchestration
- Environment-based configuration

### Project Structure

```
AI4Devs-backend-2604/
├── backend/
│   ├── src/
│   │   ├── application/     # Application logic
│   │   ├── domain/          # Business logic and models
│   │   ├── presentation/    # Controllers and API handlers
│   │   ├── routes/          # API route definitions
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Database migrations
│   │   └── seed.ts          # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── assets/          # Static assets
│   │   └── App.tsx          # Main application component
│   └── package.json
├── docker-compose.yml       # Database service configuration
├── .env                     # Environment variables
└── README.md               # Project documentation
```

## Database Schema

### Core Entities

**Candidate Management:**
- `Candidate`: Main candidate profile with personal information
- `Education`: Academic background and qualifications
- `WorkExperience`: Professional experience history
- `Resume`: CV file uploads and metadata

**Company & Position Management:**
- `Company`: Organization information
- `Employee`: Company employees and interviewers
- `Position`: Job postings and vacancies

**Interview Process:**
- `Application`: Candidate applications to positions
- `InterviewFlow`: Interview workflow templates
- `InterviewStep`: Individual steps in interview process
- `InterviewType`: Categories of interviews
- `Interview`: Scheduled interview sessions

### Key Relationships

- Candidates can have multiple education records, work experiences, and resumes
- Candidates apply to multiple positions through applications
- Applications follow a structured interview flow with multiple steps
- Employees conduct interviews at various steps
- Companies have multiple positions and employees

## API Endpoints

### Main Endpoints
- `GET/POST/PUT/DELETE /candidates` - Candidate CRUD operations
- `POST /upload` - File upload for CVs and documents

### Server Configuration
- Backend server: `http://localhost:3010`
- Frontend application: `http://localhost:3000`
- CORS enabled for frontend-backend communication

## Development Setup

### Prerequisites
- Node.js and npm
- Docker and Docker Compose
- PostgreSQL client (optional)

### Installation Steps

1. **Clone and Install Dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Database Setup:**
   ```bash
   docker-compose up -d
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ts-node seed.ts
   ```

3. **Start Development Servers:**
   ```bash
   # Backend (port 3010)
   cd backend && npm run dev
   
   # Frontend (port 3000)
   cd frontend && npm start
   ```

### Database Configuration

**PostgreSQL Connection:**
- Host: localhost
- Port: 5432
- Database: LTIdb
- User: LTIdbUser
- Password: Configured in environment variables

**Environment Variables (.env):**
```
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
```

## Sample API Usage

### Create Candidate Example
```http
POST http://localhost:3010/candidates
Content-Type: application/json

{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```

## Key Features

1. **Candidate Management**: Complete profile management with education and work history
2. **Resume Upload**: File handling for CV documents
3. **Company Management**: Organization and employee management
4. **Position Posting**: Job vacancy management with detailed descriptions
5. **Application Tracking**: Candidate application management
6. **Interview Workflow**: Structured interview process management
7. **Employee Scheduling**: Interviewer assignment and scheduling

## Development Notes

- Backend follows clean architecture principles with separation of concerns
- TypeScript provides type safety across the entire stack
- Prisma enables type-safe database operations
- Docker ensures consistent database environment across development teams
- CORS configured for local development between frontend and backend

## Next Steps

Potential enhancements could include:
- Authentication and authorization system
- Email notifications for interview scheduling
- Advanced reporting and analytics
- Integration with external job boards
- Mobile-responsive frontend improvements
