import time
import asyncio
import traceback
from backend.app.core.database import SessionLocal
from backend.app.agents.orchestrator import AgentOrchestrator

def main():
    print("1. Opening DB session...", flush=True)
    db = SessionLocal()
    try:
        print("2. Initializing AgentOrchestrator...", flush=True)
        orc = AgentOrchestrator(db=db)
        print("3. Calling execute_advisory_pipeline...", flush=True)
        t0 = time.time()
        res = asyncio.run(orc.execute_advisory_pipeline(
            'c79d5ff8-3cbd-4f85-9336-94e395877a0f',
            'Is current weather suitable for urea top-dressing?',
            language='en'
        ))
        print(f"4. Finished in {time.time()-t0:.2f}s!", flush=True)
        print("Title:", res['advisory'].get('title'), flush=True)
        print("Summary:", res['advisory'].get('summary'), flush=True)
        print("Steps:", res['advisory'].get('actionable_steps'), flush=True)
    except Exception as e:
        print("ERROR:", flush=True)
        traceback.print_exc()
    finally:
        db.close()
        print("5. DB closed.", flush=True)

if __name__ == "__main__":
    main()

