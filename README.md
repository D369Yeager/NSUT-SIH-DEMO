# SI — Skill Intelligence Platform

## 1. Project Information

- **Project Title:** SI – Skill Intelligence Platform (AI-Enabled Skill Intelligence & Learning Platform)
- **PS ID:** SIH26101
- **PS Title:** AI-Enabled Skill Intelligence & Learning Platform — iGOT Karmayogi Integration
- **Category:** Software
- **Theme:** Smart Governance / Skill Development

## 2. Team

**Team Name:** Runtime Terror
**Branch:** CSAI

| Name | Role | Enrollment No. | Email |
|---|---|---|---|
| Arav Sharma | Team Leader | 2025UCA1937 | aravsharma.28.2007@gmail.com |
| Gourav Kumar | Member | 2025UCA1962 | gouravkumar78278@gmail.com |
| Aditya Prakash | Member | 2025UCA1942 | adijuly11@gmail.com |
| Tanush Sharma | Member | 2025UCA1920 | sharma.tanush@gmail.com |
| Vanya Kapoor | Member | 2025UCA1940 | vanyakapoor1010@gmail.com |
| Gunvir Singh | Member | 2025UCA1915 | reachapple303a@gmail.com |

## 3. Problem Statement

Government officials often lack visibility into their own competency gaps against their role benchmarks, and training content is not personalized to close those gaps. Creating assessments from training material is manual and slow, making it hard to verify learning outcomes at scale.

## 4. Proposed Solution

SI reads an official's competency profile, compares it against a role benchmark across multiple domains, and recommends real courses tagged to the domains with the biggest gaps. It also lets admins upload any training document (PDF/DOCX) and instantly generates a structured AI quiz from it using Gemini — turning static training material into assessable content in seconds.

## 5. Key Features

- Profile → Gap Analysis: compares an official's competency scores against a role benchmark across 4 domains
- Gap → Course Match: recommends real courses tied to the weakest domains, with "why this course" reasoning
- Document → AI Quiz: upload a PDF/DOCX, select a competency domain, and get an AI-generated MCQ quiz with explanations
- Two role-based experiences: Learner (readiness score, recommended courses, skill profile) and Admin (quiz generation, org-wide competency insights, department drill-down)
- Org-wide analytics dashboard for admins

## 6. Technology Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Python, FastAPI
- AI: Gemini (quiz generation)
- Database: SQLite (auto-seeded)
- Deployment: Vercel (frontend), Render (backend)

## 7. Architecture

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

## 8. Repository Structure

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

## 9. Final Presentation

See [submission/PRESENTATION.md](submission/PRESENTATION.md).

## 10. Demo Video

See [submission/DEMO.md](submission/DEMO.md).

## 11. Screenshots / Prototype Photos

![Learner Homepage](assets/screenshots/01-learner-homepage.png)
![Learner's Course Track](assets/screenshots/02-learner-track.png)
![Admin Quiz Generation](assets/screenshots/03-admin-quiz-generation.png)

## 12. Installation

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

## 13. Run

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

## 14. Future Scope

- Expand competency domains beyond the current 4 to cover role-specific specializations
- Add analytics export (PDF/CSV reports) for department-level insights
- Support additional document formats and richer quiz question types (not just MCQ)
- Add notification/reminder system to nudge learners toward closing skill gaps

## Important

Before submission, make sure the repository is accessible to reviewers. Do **not** upload passwords, API keys, access tokens, `.env` files containing secrets, or other confidential credentials.
