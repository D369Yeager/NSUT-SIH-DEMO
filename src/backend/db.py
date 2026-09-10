"""
db.py — SQLite setup + seed data.

Why SQLite instead of Postgres: for a 3-day solo build, we don't want a
separate database service to configure/deploy. SQLite is a single file,
zero config, and completely fine for a hackathon demo. If this project
continues past the hackathon, swapping to Postgres later only touches
this file (the queries below use plain SQL, easy to port).
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")

# The 4 domains from the blueprint — used everywhere as the fixed taxonomy
DOMAINS = ["Statistical", "Technical", "Digital Governance", "Behavioural/Managerial"]


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Creates tables if they don't exist. Safe to call every startup."""
    conn = get_conn()
    cur = conn.cursor()

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS officials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('learner', 'admin')),
        designation TEXT,
        department TEXT
    );

    CREATE TABLE IF NOT EXISTS competencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        official_id INTEGER NOT NULL,
        domain TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (official_id) REFERENCES officials(id),
        UNIQUE(official_id, domain)
    );

    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        duration_hours INTEGER,
        provider TEXT,
        competency_tags TEXT  -- comma-separated tags
    );

    CREATE TABLE IF NOT EXISTS course_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        official_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        status TEXT DEFAULT 'recommended',  -- recommended | in_progress | completed
        FOREIGN KEY (official_id) REFERENCES officials(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        official_id INTEGER,
        source_filename TEXT,
        domain TEXT,
        questions_json TEXT NOT NULL,  -- stores the generated MCQs as JSON text
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        official_id INTEGER NOT NULL,
        domain TEXT NOT NULL,
        score_percent INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (official_id) REFERENCES officials(id)
    );
    """)
    conn.commit()

    # Seed only if empty, so re-running the server doesn't duplicate data
    cur.execute("SELECT COUNT(*) as c FROM officials")
    if cur.fetchone()["c"] == 0:
        _seed(conn)

    conn.close()


def _seed(conn):
    cur = conn.cursor()

    # NOTE: plaintext passwords are fine ONLY because this is a hackathon
    # demo with fake data. Never do this in anything real.
    officials = [
        ("Anita Sharma", "anita", "demo123", "learner", "Section Officer", "Statistics Division"),
        ("Ravi Kumar", "ravi", "demo123", "learner", "Deputy Director", "Digital Governance Cell"),
        ("Priya Nair", "priya", "admin123", "admin", "Joint Secretary (Training)", "HR & Capacity Building"),
    ]
    cur.executemany(
        "INSERT INTO officials (name, username, password, role, designation, department) VALUES (?,?,?,?,?,?)",
        officials,
    )

    # Seed starting competency scores (0-100) per domain per learner.
    # Deliberately uneven so gap analysis has something real to show.
    comp_seed = [
        (1, "Statistical", 40), (1, "Technical", 55), (1, "Digital Governance", 30), (1, "Behavioural/Managerial", 70),
        (2, "Statistical", 60), (2, "Technical", 35), (2, "Digital Governance", 45), (2, "Behavioural/Managerial", 50),
    ]
    cur.executemany(
        "INSERT INTO competencies (official_id, domain, score) VALUES (?,?,?)",
        comp_seed,
    )

    # Seed a small realistic mock course catalog (stand-in for real iGOT data)
    courses = [
        ("Foundations of Statistical Analysis", "Statistical", 6, "iGOT Karmayogi", "data_analysis,statistics,reporting"),
        ("Advanced Survey Methodology", "Statistical", 8, "iGOT Karmayogi", "statistics,survey_design,data_analysis"),
        ("Data Visualization for Policy Makers", "Statistical", 4, "iGOT Karmayogi", "data_analysis,visualization,reporting"),
        ("Python for Government Analysts", "Technical", 10, "iGOT Karmayogi", "programming,technical,data_analysis"),
        ("Cloud Computing Basics for PSUs", "Technical", 6, "iGOT Karmayogi", "cloud,technical,infrastructure"),
        ("Cybersecurity Essentials", "Technical", 5, "iGOT Karmayogi", "technical,security,cybersecurity"),
        ("e-Governance Systems Overview", "Digital Governance", 5, "iGOT Karmayogi", "digital_governance,egov,policy"),
        ("Digital Public Infrastructure 101", "Digital Governance", 6, "iGOT Karmayogi", "digital_governance,dpi,policy"),
        ("Blockchain for Public Records", "Digital Governance", 4, "iGOT Karmayogi", "digital_governance,blockchain,technical"),
        ("Leadership for Public Servants", "Behavioural/Managerial", 8, "iGOT Karmayogi", "leadership,managerial,communication"),
        ("Effective Team Management", "Behavioural/Managerial", 5, "iGOT Karmayogi", "managerial,team_management,leadership"),
        ("Conflict Resolution in Govt Offices", "Behavioural/Managerial", 3, "iGOT Karmayogi", "managerial,conflict_resolution,communication"),
    ]
    cur.executemany(
        "INSERT INTO courses (title, domain, duration_hours, provider, competency_tags) VALUES (?,?,?,?,?)",
        courses,
    )

    conn.commit()
