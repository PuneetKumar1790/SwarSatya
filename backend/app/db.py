"""SQLite database interface for SwarSatya risk logging, security incidents, and audit trails."""
import sqlite3
import json
import time
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any

DB_PATH = Path(__file__).resolve().parent.parent / "swarsatya.db"

# Global in-memory privacy flag (can also be persisted)
PRIVACY_FEATURE_ONLY_LOGGING = False
RAW_AUDIO_RETENTION = False


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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_incidents (
                incident_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                room_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                risk_score REAL NOT NULL,
                threat_tier TEXT NOT NULL,
                caller_number TEXT NOT NULL,
                claimed_identity TEXT NOT NULL,
                transaction_amount REAL DEFAULT 0.0,
                action_taken TEXT NOT NULL,
                resolution_status TEXT DEFAULT 'INVESTIGATING',
                assigned_to TEXT DEFAULT 'Security Operations Center (Tier 2)',
                reason TEXT DEFAULT ''
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS model_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feedback_id TEXT UNIQUE,
                session_id TEXT NOT NULL,
                room_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                caller_number TEXT DEFAULT '',
                claimed_identity TEXT DEFAULT '',
                original_risk REAL DEFAULT 0.0,
                user_verdict TEXT NOT NULL,
                comments TEXT DEFAULT '',
                action_requested TEXT DEFAULT 'LOG_ONLY'
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_trail (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                event_type TEXT NOT NULL,
                user_role TEXT NOT NULL,
                details TEXT NOT NULL
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_risk_logs_session ON risk_logs(session_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_time ON security_incidents(timestamp)")
        conn.commit()


def create_session(session_id: str, room_id: str) -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO call_sessions (session_id, room_id, start_time) VALUES (?, ?, ?)",
            (session_id, room_id, time.time())
        )
        conn.commit()
    log_audit_event("CALL_SESSION_START", "SYSTEM", f"Initiated session {session_id} in room {room_id}")


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
    # Feature-only logging: Redact raw speech text to uphold privacy
    if PRIVACY_FEATURE_ONLY_LOGGING:
        transcript_snippet = "[REDACTED: PRIVACY FEATURE LOGGING ACTIVE]"

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
    if PRIVACY_FEATURE_ONLY_LOGGING:
        full_transcript = "[REDACTED: PRIVACY FEATURE LOGGING ACTIVE]"

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
    log_audit_event("CALL_SESSION_END", "SYSTEM", f"Ended session {session_id} - Peak Risk: {peak_overall} ({final_tier})")


def create_security_incident(
    session_id: str,
    room_id: str,
    risk_score: float,
    threat_tier: str,
    caller_number: str,
    claimed_identity: str,
    transaction_amount: float,
    action_taken: str,
    reason: str
) -> str:
    """Creates a formal security incident ticket for SOC operations."""
    incident_id = f"INC-2026-{uuid.uuid4().hex[:5].upper()}"
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO security_incidents (
                incident_id, session_id, room_id, timestamp, risk_score,
                threat_tier, caller_number, claimed_identity, transaction_amount,
                action_taken, resolution_status, reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INVESTIGATING', ?)
        """, (
            incident_id, session_id, room_id, time.time(), risk_score,
            threat_tier, caller_number, claimed_identity, transaction_amount,
            action_taken, reason
        ))
        conn.commit()
    log_audit_event(
        "SECURITY_INCIDENT_CREATED",
        "AUTOMATED_POLICY_ENGINE",
        f"{incident_id} logged for {claimed_identity} (Risk: {risk_score}%, Action: {action_taken})"
    )
    return incident_id


def resolve_incident(incident_id: str, status: str, officer_notes: str = "") -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE security_incidents
            SET resolution_status = ?
            WHERE incident_id = ?
        """, (status, incident_id))
        conn.commit()
    log_audit_event("INCIDENT_RESOLVED", "SECURITY_OFFICER", f"{incident_id} marked as {status}. Notes: {officer_notes}")
    return True


def get_incidents(limit: int = 20) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM security_incidents ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def log_audit_event(event_type: str, user_role: str, details: str) -> None:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO audit_trail (timestamp, event_type, user_role, details)
                VALUES (?, ?, ?, ?)
            """, (time.time(), event_type, user_role, details))
            conn.commit()
    except Exception:
        pass


def get_audit_trail(limit: int = 30) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audit_trail ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def add_feedback(
    session_id: str,
    room_id: str,
    caller_number: str,
    claimed_identity: str,
    original_risk: float,
    user_verdict: str,
    comments: str = "",
    action_requested: str = "LOG_ONLY"
) -> str:
    feedback_id = f"FB-{uuid.uuid4().hex[:6].upper()}"
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO model_feedback (
                feedback_id, session_id, room_id, timestamp, caller_number,
                claimed_identity, original_risk, user_verdict, comments, action_requested
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            feedback_id, session_id, room_id, time.time(), caller_number,
            claimed_identity, original_risk, user_verdict, comments, action_requested
        ))
        conn.commit()
    log_audit_event("FEEDBACK_SUBMITTED", "USER", f"Feedback {feedback_id}: Verdict={user_verdict}, Action={action_requested}")
    return feedback_id


def get_all_feedback(limit: int = 30) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM model_feedback ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def set_privacy_config(feature_only: bool, raw_audio: bool):
    global PRIVACY_FEATURE_ONLY_LOGGING, RAW_AUDIO_RETENTION
    PRIVACY_FEATURE_ONLY_LOGGING = feature_only
    RAW_AUDIO_RETENTION = raw_audio
    log_audit_event(
        "PRIVACY_POLICY_UPDATED",
        "SECURITY_ADMIN",
        f"Feature-only logging: {feature_only}, Raw audio retention: {raw_audio}"
    )


def get_privacy_config() -> Dict[str, Any]:
    return {
        "feature_only_logging": PRIVACY_FEATURE_ONLY_LOGGING,
        "raw_audio_retention": RAW_AUDIO_RETENTION,
        "edge_inference_support": True,
        "anonymization_status": "ACTIVE"
    }


# Ensure SQLite tables and indices exist immediately
try:
    init_db()
except Exception as _e:
    pass

