# Running the backend on your machine — Day 1 checklist

## 1. Install Python dependencies
```
cd backend
pip install -r requirements.txt
```
(If you're on a system that requires it: `pip install -r requirements.txt --break-system-packages`)

## 2. Get a free Gemini API key + set it up

1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account, click "Create API key" — no credit card required for the free tier
3. Copy the key

In the `backend` folder, duplicate `.env.example` → rename the copy to exactly `.env`, then open it and paste your real key in:

```
GEMINI_API_KEY=your-actual-key-here
```

That's it — the app automatically reads this file every time it starts (via `python-dotenv`), so you never have to type the key into a terminal.

⚠️ **Never commit or share your real `.env` file.** It's already in `.gitignore` so it won't get pushed to GitHub. Only `.env.example` (with no real key) should ever be committed. Never paste your real key into our chat either.

**Free tier limits to be aware of:** Gemini's free tier has a request-per-minute cap (generous enough for a demo, but if you're rapid-fire testing quiz generation over and over in a short burst, you might briefly hit a rate limit — just wait a few seconds and retry if that happens.

## 3. Start the server
```
uvicorn app:app --reload --port 8000
```
Visit http://localhost:8000/docs — you'll see interactive Swagger docs for every endpoint.

## 4. Test login (already seeded with demo users)
| username | password | role |
|---|---|---|
| anita | demo123 | learner |
| ravi | demo123 | learner |
| priya | admin123 | admin |

Try it via the `/docs` page: click `POST /auth/login` → "Try it out" → paste:
```json
{"username": "anita", "password": "demo123"}
```
You'll get a token back — click the padlock icon at the top of the `/docs` page and paste that token in to unlock the other endpoints for testing.

## 5. The big one — test the quiz generator
In `/docs`, find `POST /quiz/generate`, click "Try it out," upload any PDF/DOCX/TXT file, set `domain` to something like `Technical`, and hit Execute. If your API key is set correctly, you should get back a JSON object with generated questions within a few seconds.

**If this fails, send me the exact error message** — that's priority #1 to fix before we touch the frontend.

## What's already tested and confirmed working (I ran these myself)
- ✅ Health check
- ✅ Login + JWT token issuance
- ✅ Gap analysis (real math against seeded competency scores)
- ✅ Course recommendations (tag-matching against real gaps)
- ✅ Admin analytics (org-wide + department breakdown)
- ✅ RBAC (learner correctly blocked from admin routes with a 403)

## What you need to test (I can't — needs your live API key)
- ⬜ Quiz generation from an uploaded document
