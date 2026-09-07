"""Pydantic schemas for SwarSatya (SIH #26104)."""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PingMessage(BaseModel):
    type: str = "ping"
    client_time: Optional[float] = None
    room_id: Optional[str] = None
    data: Optional[str] = None


class PongMessage(BaseModel):
    type: str = "pong"
    server_time: float
    room_id: Optional[str] = None
    message: str = "pong"


class WebRTCSignalingMessage(BaseModel):
    type: str  # "join", "offer", "answer", "candidate", "leave", "user-joined", "user-left"
    room_id: str
    sender_id: Optional[str] = None
    target_id: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None


class RiskUpdate(BaseModel):
    type: str = "risk_update"
    room_id: str
    timestamp: float
    chunk_index: int
    synthetic_risk: float = Field(ge=0.0, le=100.0)
    scam_risk: float = Field(ge=0.0, le=100.0)
    overall_risk: float = Field(ge=0.0, le=100.0)
    threat_tier: str  # "LOW", "CAUTION", "HIGH", "CRITICAL"
    recommended_action: str
    transcript_snippet: str = ""
    detected_patterns: List[str] = []
    processing_latency_ms: float = 0.0


class CallSessionSummary(BaseModel):
    session_id: str
    room_id: str
    start_time: float
    end_time: Optional[float] = None
    peak_synthetic_risk: float = 0.0
    peak_scam_risk: float = 0.0
    peak_overall_risk: float = 0.0
    final_threat_tier: str = "LOW"
    total_chunks_analyzed: int = 0
    full_transcript: str = ""
