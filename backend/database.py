import sqlite3
import json

DB_PATH = "runs.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            timestamp TEXT,
            prospect TEXT,
            company TEXT,
            edge_case TEXT,
            research_summary TEXT,
            hook TEXT,
            email_draft TEXT,
            status TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_run(data: dict):
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        INSERT INTO runs VALUES (?,?,?,?,?,?,?,?,?)
    ''', (
        data["run_id"],
        data["timestamp"],
        data["prospect"],
        data["company"],
        data["edge_case"],
        data["research_summary"],
        data["hook"],
        data["email_draft"],
        data["status"]
    ))
    conn.commit()
    conn.close()

def get_all_runs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        'SELECT * FROM runs ORDER BY timestamp DESC'
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]