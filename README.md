# SI — Skill Intelligence Platform

## 1. Project Information

- **Project Title:** SI – Skill Intelligence Platform (AI-Enabled Skill Intelligence & Learning Platform)
- **PS ID:** SIH26101
- **PS Title:** AI-Enabled Skill Intelligence & Learning Platform — iGOT Karmayogi Integration
- **Category:** Software
- **Theme:** Smart Governance / Skill Development

## 2. Problem Statement

Government officials often lack visibility into their own competency gaps against their role benchmarks, and training content is not personalized to close those gaps. Creating assessments from training material is manual and slow, making it hard to verify learning outcomes at scale.

## 3. Proposed Solution

SI reads an official's competency profile, compares it against a role benchmark across multiple domains, and recommends real courses tagged to the domains with the biggest gaps. It also lets admins upload any training document (PDF/DOCX) and instantly generates a structured AI quiz from it using Gemini — turning static training material into assessable content in seconds.

## 4. Key Features

- Profile → Gap Analysis: compares an official's competency scores against a role benchmark across 4 domains
- Gap → Course Match: recommends real courses tied to the weakest domains, with "why this course" reasoning
- Document → AI Quiz: upload a PDF/DOCX, select a competency domain, and get an AI-generated MCQ quiz with explanations
- Two role-based experiences: Learner (readiness score, recommended courses, skill profile) and Admin (quiz generation, org-wide competency insights, department drill-down)
- Org-wide analytics dashboard for admins

## 5. Technology Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Python, FastAPI
- AI: Gemini (quiz generation)
- Database: SQLite (auto-seeded)
- Deployment: Vercel (frontend), Render (backend)

## 6. Architecture

\`\`\`text
User (Learner / Admin)
  |
  v
Frontend (React + Vite, Tailwind)
  |
  v
Backend API (FastAPI)
  |
  +----> SQLite Database
  |
  v
Gemini AI (quiz generation)
  |
  v
Gap Analysis / Course Recommendations / Generated Quiz
\`\`\`

## 7. Repository Structure

\`\`\`text
NSUT-SIH-DEMO/
├── README.md
├── submission/
│   ├── PRESENTATION.md
│   └── DEMO.md
├── frontend/
│   └── ... (React + Vite app)
├── backend/
│   └── ... (FastAPI app)
├── docs/
│   └── architecture.md
├── assets/
│   └── screenshots/
├── requirements.txt
├── .gitignore
└── LICENSE
\`\`\`

## 8. Final Presentation

See [submission/PRESENTATION.md](submission/PRESENTATION.md).

## 9. Demo Video

See [submission/DEMO.md](submission/DEMO.md).

## 10. Screenshots / Prototype Photos

![Learner Homepage](assets/screenshots/01-learner-homepage.png)
![Learner's Course Track](assets/screenshots/02-learner-track.png)
![Admin Quiz Generation](assets/screenshots/03-admin-quiz-generation.png)

## 11. Installation

\`\`\`bash
git clone https://github.com/D369Yeager/NSUT-SIH-DEMO.git
cd NSUT-SIH-DEMO

# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
\`\`\`

## 12. Run

\`\`\`bash
# Backend (from backend/)
uvicorn main:app --reload

# Frontend (from frontend/)
npm run dev
\`\`\`

**Live deployment:**
- Frontend: https://sih26101-mvp.vercel.app
- Backend API docs: https://sih26101-mvp-1.onrender.com/docs

**Demo logins:**
- Learner — username: `anita`, password: `demo123`
- Admin — username: `priya`, password: `admin123`

## 13. Future Scope

- Expand competency domains beyond the current 4 to cover role-specific specializations
- Add analytics export (PDF/CSV reports) for department-level insights
- Support additional document formats and richer quiz question types (not just MCQ)
- Add notification/reminder system to nudge learners toward closing skill gaps
