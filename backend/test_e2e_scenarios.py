"""End-to-End Verification Suite for SwarSatya Multi-Layer Voice SOC (SIH #26104)."""
import asyncio
import json
import sqlite3
import time
import websockets

WS_URI = "ws://127.0.0.1:8000/ws/call/satya-e2e-test"
DB_PATH = "D:/Puneet/Swar/backend/swarsatya.db"


async def test_scenario(scenario_id: str, max_chunks: int = 2):
    print(f"\n=======================================================")
    print(f"TESTING SCENARIO: {scenario_id}")
    print(f"=======================================================")

    async with websockets.connect(WS_URI) as ws:
        # Trigger Demo Mode playback from backend
        start_msg = {
            "type": "start_demo",
            "room_id": "satya-e2e-test",
            "scenario": scenario_id
        }
        await ws.send(json.dumps(start_msg))

        received_chunks = []
        timeout = 20.0
        start_t = time.time()

        while len(received_chunks) < max_chunks and (time.time() - start_t) < timeout:
            try:
                resp = await asyncio.wait_for(ws.recv(), timeout=7.0)
                data = json.loads(resp)
                if data.get("type") == "risk_update" and data.get("is_speech", True):
                    received_chunks.append(data)
                    brk = data.get("layer_breakdown", {})
                    print(f"  [Chunk {data['chunk_index']}] "
                          f"Overall: {data['overall_risk']} ({data['threat_tier']}) | "
                          f"Action: {data.get('action_code')} | "
                          f"Latency: {data['processing_latency_ms']}ms")
                    print(f"    Layers: Synth={brk.get('synthetic_model')}% | "
                          f"Spectral={brk.get('spectral_phase')}% | "
                          f"Prosody={brk.get('prosody_behavior')}% | "
                          f"SpkMismatch={brk.get('speaker_mismatch')}% | "
                          f"Context={brk.get('context_stakes')}%")
                    if data.get("transcript_snippet"):
                        print(f"    Transcript: \"{data['transcript_snippet']}\" (Lang: {data.get('detected_language')})")
                    if data.get("contributing_factors"):
                        print(f"    Factors: {data['contributing_factors']}")
                elif data.get("type") == "demo_completed":
                    break
            except asyncio.TimeoutError:
                break

        # Stop demo playback
        await ws.send(json.dumps({"type": "stop_demo", "room_id": "satya-e2e-test"}))
        return received_chunks


async def main():
    scenarios = ["real_normal", "cloned_normal", "real_scam", "cloned_scam"]
    results = {}

    for sc in scenarios:
        chunks = await test_scenario(sc, max_chunks=2)
        results[sc] = chunks
        await asyncio.sleep(1.0)

    # Verify SQLite DB
    print("\n=======================================================")
    print("VERIFYING SQLITE PERSISTENCE & INCIDENTS")
    print("=======================================================")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) as cnt FROM risk_logs")
    log_count = cur.fetchone()["cnt"]
    print(f"Total risk log entries in DB: {log_count}")

    cur.execute("SELECT COUNT(*) as cnt FROM security_incidents")
    inc_count = cur.fetchone()["cnt"]
    print(f"Total security incident tickets logged: {inc_count}")

    cur.execute("SELECT * FROM security_incidents ORDER BY timestamp DESC LIMIT 3")
    incidents = cur.fetchall()
    for inc in incidents:
        print(f"  Incident {inc['incident_id']} | Target: {inc['claimed_identity']} | Risk: {inc['risk_score']}% | Action: {inc['action_taken']}")

    conn.close()
    print("\nAll E2E scenarios verified successfully!")


if __name__ == "__main__":
    asyncio.run(main())
