import time
import asyncio
import traceback
from backend.app.core.database import SessionLocal
from backend.app.integrations.weather_client import WeatherClient
from backend.app.rag.retriever import AgriculturalRetriever
from backend.app.risk_engine.calculator import CropRiskEngine
from backend.app.models.entities import User, FarmerProfile, Farm, FarmCrop, CropCatalog

async def run_diagnostics():
    db = SessionLocal()
    try:
        print("[1] Querying DB entities...", flush=True)
        t0 = time.time()
        user = db.query(User).filter(User.id == 'c79d5ff8-3cbd-4f85-9336-94e395877a0f').first()
        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        farm = db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first()
        farm_crop = db.query(FarmCrop).filter(FarmCrop.farm_id == farm.id).first()
        crop = farm_crop.crop if farm_crop else db.query(CropCatalog).first()
        print(f"    Entities loaded in {time.time()-t0:.2f}s: Crop={crop.common_name}", flush=True)

        print("[2] Fetching Weather...", flush=True)
        t0 = time.time()
        w_data = await WeatherClient.get_current_and_forecast(20.7002, 77.0082)
        print(f"    Weather fetched in {time.time()-t0:.2f}s: Temp={w_data['current']['temperature_c']}C", flush=True)

        print("[3] Evaluating Risk Engine...", flush=True)
        t0 = time.time()
        risk = CropRiskEngine.evaluate_risk(
            crop=crop,
            stage=None,
            current_weather=w_data["current"],
            forecast_daily=w_data["daily_forecast"],
            db=db
        )
        print(f"    Risk evaluated in {time.time()-t0:.2f}s: Score={risk['risk_score']}", flush=True)

        print("[4] Searching RAG Retriever...", flush=True)
        t0 = time.time()
        evidence = AgriculturalRetriever.search(
            query="Is current weather suitable for urea top-dressing?",
            db=db,
            crop_name=crop.common_name,
            top_k=2
        )
        print(f"    RAG search finished in {time.time()-t0:.2f}s: Chunks={len(evidence)}", flush=True)

        print("[5] Testing Gemini URL...", flush=True)
        from backend.app.agents.orchestrator import AgentOrchestrator
        orc = AgentOrchestrator(db=db)
        t0 = time.time()
        adv = await orc._synthesize_with_gemini(
            farmer_name=user.full_name,
            crop_name=crop.common_name,
            growth_stage="Flowering",
            location="Akola, Maharashtra",
            weather=w_data["current"],
            risk=risk,
            evidence=evidence,
            farmer_query="Is current weather suitable for urea top-dressing?",
            language="en"
        )
        print(f"    Gemini call finished in {time.time()-t0:.2f}s! Title: {adv.get('title')}", flush=True)

    except Exception as e:
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_diagnostics())

