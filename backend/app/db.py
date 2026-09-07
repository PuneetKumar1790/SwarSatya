"""SQLite database interface for SwarSatya risk logging and call sessions."""
import sqlite3
import json
import time
from pathlib import Path
from typing import Optional, List, Dict, Any

DB_PATH = Path(__file__).resolve().parent.parent / "swarsatya.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if tables do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS call_sessions (
                session_id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                start_time REAL NOT NULL,
                end_time REAL,
                peak_synthetic_risk REAL DEFAULT 0.0,
                peak_scam_risk REAL DEFAULT 0.0,
                peak_overall_risk REAL DEFAULT 0.0,
                final_threat_tier TEXT DEFAULT 'LOW',
                total_chunks INTEGER DEFAULT 0,
                full_transcript TEXT DEFAULT ''
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS risk_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                room_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                chunk_index INTEGER NOT NULL,
                synthetic_risk REAL NOT NULL,
                scam_risk REAL NOT NULL,
                overall_risk REAL NOT NULL,
                threat_tier TEXT NOT NULL,
                transcript_snippet TEXT DEFAULT '',
                detected_patterns TEXT DEFAULT '[]',
                processing_latency_ms REAL DEFAULT 0.0,
                FOREIGN KEY(session_id) REFERENCES call_sessions(session_id)
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_risk_logs_session ON risk_logs(session_id)")
        conn.commit()


def create_session(session_id: str, room_id: str) -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO call_sessions (session_id, room_id, start_time) VALUES (?, ?, ?)",
            (session_id, room_id, time.time())
        )
        conn.commit()


def log_risk_chunk(
    session_id: str,
    room_id: str,
    chunk_index: int,
    synthetic_risk: float,
    scam_risk: float,
    overall_risk: float,
    threat_tier: str,
    transcript_snippet: str = "",
    detected_patterns: Optional[List[str]] = None,
    processing_latency_ms: float = 0.0
) -> None:
    patterns_json = json.dumps(detected_patterns or [])
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO risk_logs (
                session_id, room_id, timestamp, chunk_index,
                synthetic_risk, scam_risk, overall_risk, threat_tier,
                transcript_snippet, detected_patterns, processing_latency_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id, room_id, time.time(), chunk_index,
            synthetic_risk, scam_risk, overall_risk, threat_tier,
            transcript_snippet, patterns_json, processing_latency_ms
        ))
        conn.commit()


def end_session(
    session_id: str,
    peak_synthetic: float,
    peak_scam: float,
    peak_overall: float,
    final_tier: str,
    total_chunks: int,
    full_transcript: str
) -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE call_sessions
            SET end_time = ?,
                peak_synthetic_risk = ?,
                peak_scam_risk = ?,
                peak_overall_risk = ?,
                final_threat_tier = ?,
                total_chunks = ?,
                full_transcript = ?
            WHERE session_id = ?
        """, (
            time.time(), peak_synthetic, peak_scam, peak_overall,
            final_tier, total_chunks, full_transcript, session_id
        ))
        conn.commit()
