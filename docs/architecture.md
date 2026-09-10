# System Architecture

## High-level flow

```text
User (Learner / Admin)
  |
  v
Frontend (React + Vite, Tailwind CSS)
  |
  v
Backend API (FastAPI)
  |
  +------------------> Database (SQLite)
  |
  v
Gemini AI (quiz generation from uploaded documents)
  |
  v
Gap Analysis / Course Recommendations / Generated Quiz
  |
  v
Frontend
```

## Components

### Frontend
Built with React + Vite and styled with Tailwind CSS. Provides two role-based experiences:
- **Learner view** — readiness score, recommended courses, skill profile with gap bars, quiz-taking interface
- **Admin view** — document upload for quiz generation, org-wide competency insights, department drill-down

### Backend API
Built with FastAPI. Handles authentication (role-based: Learner/Admin), serves competency and course data, processes document uploads, and coordinates calls to the Gemini AI service.

### Database
SQLite, auto-seeded on startup. Stores user profiles, competency scores per domain, course catalog, quiz data, and quiz attempt history.

### Gemini AI (Quiz Generation)
Receives an uploaded document (PDF/DOCX) along with a selected competency domain, and generates a structured MCQ quiz — including correct answers and explanations — in seconds.

### Gap Analysis Engine
Compares a Learner's competency scores against a role benchmark across 4 domains, tagging each domain as "Ready" or "Gap."

### Course Recommendation Engine
Matches Learners to real courses tagged to whichever domains show the biggest gaps, with reasoning for why each course was recommended.

## Deployment

- Frontend hosted on **Vercel**
- Backend API hosted on **Render**

