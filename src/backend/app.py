"""
app.py — SIH26101 MVP backend, single-file for a 3-day build.

Why one file: for a solo 3-day sprint, splitting into routers/services adds
navigation overhead with no real benefit at this size (~10 endpoints). If
this grows past the hackathon, split by concern (auth/courses/quiz/profile)
at that point — not before.

Covers blueprint steps 1-7 in trimmed form:
  1. Onboarding (login)
  2. Competency Profiling (seeded + viewable)
  3. Gap Analysis (rule-based, vs a fixed benchmark)
  4. Course Matching (tag overlap between gaps and course competency_tags)
  5. Document -> Quiz (RAG-lite: extract text -> LLM -> structured MCQs)
  6. Learner Interaction (submit quiz -> score updates competency)
  7. Admin Insights (aggregate stats across all officials)

Step 8 (iGOT integration hook) is represented by the fact that /courses
reads from our own DB table, not a hardcoded list — swapping in a real
iGOT API later means changing get_courses() internals only.
"""
import json
import os
from io import BytesIO
from typing import Optional

from dotenv import load_dotenv
load_dotenv()  # reads backend/.env into os.environ, if the file exists

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import init_db, get_conn, DOMAINS
from auth import create_token, decode_token, require_admin

import PyPDF2
import docx as docx_lib
import google.generativeai as genai

app = FastAPI(title="SIH26101 API")

# CORS wide open — fine for a hackathon demo where frontend and backend
# may be on different domains/ports. Would need narrowing for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BENCHMARK_TARGET = 75  # fixed target score per domain; anything below = a "gap"


@app.on_event("startup")
def startup():
    init_db()


# ---------- Schemas ----------

class LoginRequest(BaseModel):
    username: str
    password: str


class QuizSubmitRequest(BaseModel):
    official_id: int
    domain: str
    score_percent: int  # 0-100, computed by the frontend from correct answers


# ---------- Auth ----------

@app.post("/auth/login")
def login(body: LoginRequest):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM officials WHERE username=? AND password=?",
        (body.username, body.password),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_token(row["id"], row["username"], row["role"])
    return {
        "token": token,
        "official_id": row["id"],
        "name": row["name"],
        "role": row["role"],
    }


# ---------- Courses (Step 8: the mock iGOT layer) ----------

@app.get("/courses")
def get_courses(domain: Optional[str] = None):
    conn = get_conn()
    if domain:
        rows = conn.execute("SELECT * FROM courses WHERE domain=?", (domain,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM courses").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ---------- Profile & Gap Analysis (Steps 2-3) ----------

@app.get("/officials/{official_id}/profile")
def get_profile(official_id: int, payload: dict = Depends(decode_token)):
    conn = get_conn()
    official = conn.execute("SELECT * FROM officials WHERE id=?", (official_id,)).fetchone()
    if not official:
        conn.close()
        raise HTTPException(status_code=404, detail="Official not found")
    comps = conn.execute(
        "SELECT domain, score FROM competencies WHERE official_id=?", (official_id,)
    ).fetchall()
    conn.close()
    return {
        "id": official["id"],
        "name": official["name"],
        "designation": official["designation"],
        "department": official["department"],
        "competencies": [dict(c) for c in comps],
    }


@app.get("/officials/{official_id}/gap-analysis")
def gap_analysis(official_id: int, payload: dict = Depends(decode_token)):
    """
    Compares each domain score against BENCHMARK_TARGET.
    Returns gaps sorted worst-first — this ordering is what the
    recommendation engine below uses to prioritize courses.
    """
    conn = get_conn()
    comps = conn.execute(
        "SELECT domain, score FROM competencies WHERE official_id=?", (official_id,)
    ).fetchall()
    conn.close()

    existing = {c["domain"]: c["score"] for c in comps}
    gaps = []
    for domain in DOMAINS:
        score = existing.get(domain, 0)  # no record yet = treated as a full gap
        gap = max(0, BENCHMARK_TARGET - score)
        gaps.append({"domain": domain, "current_score": score, "target": BENCHMARK_TARGET, "gap": gap})

    gaps.sort(key=lambda g: g["gap"], reverse=True)
    return {"official_id": official_id, "gaps": gaps}


# ---------- Recommendations (Step 4) ----------

@app.get("/officials/{official_id}/recommendations")
def recommendations(official_id: int, top_n: int = 5, payload: dict = Depends(decode_token)):
    """
    Rule-based matching: takes the top gap domains, pulls courses tagged
    with that domain, ranks by how "urgent" the domain gap is.

    Why not embeddings/ChromaDB here: for a 3-day solo build, tag-based
    matching is deployable with zero extra infrastructure and gives the
    same end-user result (relevant courses for real gaps). The LLM-powered
    quiz generator below is where the actual AI showcase lives.
    """
    gaps_data = gap_analysis(official_id, payload)
    gaps = [g for g in gaps_data["gaps"] if g["gap"] > 0]

    conn = get_conn()
    results = []
    for g in gaps:
        courses = conn.execute(
            "SELECT * FROM courses WHERE domain=?", (g["domain"],)
        ).fetchall()
        for c in courses:
            results.append({
                **dict(c),
                "reason": f"Recommended because your {g['domain']} score ({g['current_score']}) is "
                          f"{g['gap']} points below the {g['target']} target.",
                "urgency_score": g["gap"],
            })
    conn.close()

    results.sort(key=lambda r: r["urgency_score"], reverse=True)
    return results[:top_n]


# ---------- Quiz Generator (Step 5 — THE DEMO CENTERPIECE) ----------

def extract_text(file: UploadFile) -> str:
    content = file.file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.endswith(".docx"):
        doc = docx_lib.Document(BytesIO(content))
        text = "\n".join(p.text for p in doc.paragraphs)
    elif filename.endswith(".txt"):
        text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from this file.")

    return text


QUIZ_PROMPT_TEMPLATE = """You are creating a multiple-choice quiz from a government training document.

Read the document text below and generate exactly {num_questions} multiple-choice questions
that test understanding of the key concepts. Each question must have exactly 4 options,
one correct answer, and a short explanation of why it's correct.

Respond with ONLY valid JSON (no markdown fences, no preamble) in exactly this shape:
{{
  "questions": [
    {{
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_index": 0,
      "explanation": "..."
    }}
  ]
}}

DOCUMENT TEXT:
{document_text}
"""


@app.post("/quiz/generate")
def generate_quiz(
    file: UploadFile = File(...),
    domain: str = Form(...),
    official_id: Optional[int] = Form(None),
    num_questions: int = Form(5),
    payload: dict = Depends(decode_token),
):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set on the server. Add it to your .env file.",
        )

    text = extract_text(file)
    # Cap document length sent to the model — keeps cost/latency predictable
    # and avoids context-limit issues on very large uploads.
    text = text[:12000]

    genai.configure(api_key=api_key)
    # Free tier = 20 requests/day PER MODEL, so we try a short list of
    # models in order and fall through to the next one if the current
    # model is rate-limited or unavailable. This makes testing (and demo
    # day itself) much more resilient than betting everything on one model.
    # Override the whole list via .env if needed: GEMINI_MODEL=name1,name2
    # gemini-flash-latest confirmed working on this account (2025-09-04 test).
    # gemini-2.5-flash and gemini-2.5-flash-lite are deprecated for new
    # users despite appearing in list_models() — kept as fallback in case
    # gemini-flash-latest itself gets rate-limited or renamed later.
    default_models = "gemini-flash-latest,gemini-3.6-flash,gemini-3.5-flash-lite"
    model_names = [m.strip() for m in os.environ.get("GEMINI_MODEL", default_models).split(",")]

    prompt = QUIZ_PROMPT_TEMPLATE.format(num_questions=num_questions, document_text=text)

    quiz_data = None
    all_errors = []
    used_model = None

    for model_name in model_names:
        print(f"[quiz-gen] Trying model: {model_name} ...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
                request_options={"timeout": 45},
            )
            raw = response.text.strip()
            raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            quiz_data = json.loads(raw)
            used_model = model_name
            print(f"[quiz-gen] SUCCESS with model: {model_name}")
            break  # success — stop trying further models
        except json.JSONDecodeError:
            msg = f"{model_name}: returned output that wasn't valid JSON"
            print(f"[quiz-gen] FAILED — {msg}")
            all_errors.append(msg)
            continue
        except Exception as e:
            msg = f"{model_name}: {str(e)}"
            print(f"[quiz-gen] FAILED — {msg}")
            all_errors.append(msg)
            continue  # try the next model in the list

    if quiz_data is None:
        raise HTTPException(
            status_code=502,
            detail=f"All {len(model_names)} models failed. Details: " + " | ".join(all_errors),
        )

    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO quizzes (official_id, source_filename, domain, questions_json) VALUES (?,?,?,?)",
        (official_id, file.filename, domain, json.dumps(quiz_data)),
    )
    conn.commit()
    quiz_id = cur.lastrowid
    conn.close()

    return {"quiz_id": quiz_id, "domain": domain, "model_used": used_model, **quiz_data}


@app.get("/quizzes")
def list_quizzes(payload: dict = Depends(decode_token)):
    conn = get_conn()
    rows = conn.execute("SELECT id, official_id, source_filename, domain, created_at FROM quizzes ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/quizzes/{quiz_id}")
def get_quiz(quiz_id: int, payload: dict = Depends(decode_token)):
    conn = get_conn()
    row = conn.execute("SELECT * FROM quizzes WHERE id=?", (quiz_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Quiz not found")
    data = dict(row)
    data["questions"] = json.loads(data.pop("questions_json"))["questions"]
    return data


# ---------- Quiz Submission -> real-time competency update (Step 6) ----------

@app.post("/quiz/submit")
def submit_quiz(body: QuizSubmitRequest, payload: dict = Depends(decode_token)):
    """
    Simple blended update: new_score = 70% old score + 30% quiz performance.
    This rewards consistent quiz performance without letting one quiz
    swing the score wildly — good enough logic for a demo, and easy to
    explain to judges in one sentence if asked.
    """
    conn = get_conn()
    existing = conn.execute(
        "SELECT score FROM competencies WHERE official_id=? AND domain=?",
        (body.official_id, body.domain),
    ).fetchone()

    old_score = existing["score"] if existing else 0
    new_score = round(old_score * 0.7 + body.score_percent * 0.3)

    if existing:
        conn.execute(
            "UPDATE competencies SET score=? WHERE official_id=? AND domain=?",
            (new_score, body.official_id, body.domain),
        )
    else:
        conn.execute(
            "INSERT INTO competencies (official_id, domain, score) VALUES (?,?,?)",
            (body.official_id, body.domain, new_score),
        )

    # Log the attempt itself (separate from the rolling competency score)
    # so we have real history to show on the Overview/My Learning pages —
    # "quizzes taken," recent activity, etc. — instead of fabricated stats.
    conn.execute(
        "INSERT INTO quiz_attempts (official_id, domain, score_percent) VALUES (?,?,?)",
        (body.official_id, body.domain, body.score_percent),
    )

    conn.commit()
    conn.close()

    return {"domain": body.domain, "old_score": old_score, "new_score": new_score}


@app.get("/officials/{official_id}/stats")
def official_stats(official_id: int, payload: dict = Depends(decode_token)):
    """
    Aggregated real stats for the Learner Overview page. Every number here
    is computed from actual stored data — nothing invented (no fake
    "learning streak" or "hours invested" we don't track).
    """
    conn = get_conn()

    comps = conn.execute(
        "SELECT domain, score FROM competencies WHERE official_id=?", (official_id,)
    ).fetchall()
    scores = [c["score"] for c in comps]
    readiness = round(sum(scores) / len(scores)) if scores else 0

    ready_count = sum(1 for s in scores if s >= BENCHMARK_TARGET)
    gap_count = len(DOMAINS) - ready_count  # domains with no record yet count as a gap

    attempts_count = conn.execute(
        "SELECT COUNT(*) as c FROM quiz_attempts WHERE official_id=?", (official_id,)
    ).fetchone()["c"]

    recent_attempts = conn.execute(
        "SELECT domain, score_percent, created_at FROM quiz_attempts "
        "WHERE official_id=? ORDER BY created_at DESC LIMIT 5",
        (official_id,),
    ).fetchall()

    conn.close()

    return {
        "readiness_score": readiness,
        "domains_ready": ready_count,
        "domains_gap": gap_count,
        "total_domains": len(DOMAINS),
        "quizzes_taken": attempts_count,
        "recent_attempts": [dict(r) for r in recent_attempts],
    }


# ---------- Admin Analytics (Step 7) ----------

@app.get("/admin/analytics")
def admin_analytics(payload: dict = Depends(require_admin)):
    conn = get_conn()

    # Org-wide average score per domain — feeds the heatmap/bar chart
    domain_avgs = conn.execute("""
        SELECT domain, ROUND(AVG(score), 1) as avg_score, COUNT(*) as official_count
        FROM competencies GROUP BY domain
    """).fetchall()

    # Per-department breakdown — feeds the drill-down view
    dept_breakdown = conn.execute("""
        SELECT o.department, c.domain, ROUND(AVG(c.score), 1) as avg_score
        FROM competencies c JOIN officials o ON c.official_id = o.id
        GROUP BY o.department, c.domain
    """).fetchall()

    total_officials = conn.execute("SELECT COUNT(*) as c FROM officials WHERE role='learner'").fetchone()["c"]
    total_quizzes = conn.execute("SELECT COUNT(*) as c FROM quizzes").fetchone()["c"]

    conn.close()

    return {
        "total_officials": total_officials,
        "total_quizzes_generated": total_quizzes,
        "domain_averages": [dict(r) for r in domain_avgs],
        "department_breakdown": [dict(r) for r in dept_breakdown],
    }


@app.get("/health")
def health():
    return {"status": "ok"}
