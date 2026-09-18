"""Pydantic schemas for SwarSatya Multi-Layer Voice SOC (SIH #26104)."""
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
    is_speech: bool = True
    overall_risk: float = Field(ge=0.0, le=100.0)
    threat_tier: str  # "LOW", "CAUTION", "HIGH", "CRITICAL"
    action_code: str = "ALLOW"
    recommended_action: str
    requires_hold: bool = False
    transaction_held: bool = False
    active_incident_id: Optional[str] = None
    layer_breakdown: Dict[str, float] = Field(default_factory=dict)
    telemetry: Dict[str, Any] = Field(default_factory=dict)
    contributing_factors: List[str] = Field(default_factory=list)
    transcript_snippet: str = ""
    detected_patterns: List[str] = Field(default_factory=list)
    detected_language: str = "en"
    processing_latency_ms: float = 0.0
    source_type: str = "live"


class SecurityIncidentSchema(BaseModel):
    incident_id: str
    session_id: str
    room_id: str
    timestamp: float
    risk_score: float
    threat_tier: str
    caller_number: str
    claimed_identity: str
    transaction_amount: float
    action_taken: str
    resolution_status: str
    reason: str


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
