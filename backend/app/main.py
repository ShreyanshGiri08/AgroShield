import sys
import os

# Guarantee root directory is on Python path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import check_db_health
from backend.app.api.farmers import router as farmers_router
from backend.app.api.weather import router as weather_router
from backend.app.api.mandi import router as mandi_router
from backend.app.api.risk import router as risk_router
from backend.app.api.advisory import router as advisory_router
from backend.app.api.diagnosis import router as diagnosis_router

app = FastAPI(
    title="AgroShield — Hyperlocal Agricultural Intelligence API",
    description="Agentic multimodal agricultural intelligence platform integrating Open-Meteo, data.gov.in, ICAR RAG, and deterministic crop-risk calculations.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development & hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(farmers_router)
app.include_router(weather_router)
app.include_router(mandi_router)
app.include_router(risk_router)
app.include_router(advisory_router)
app.include_router(diagnosis_router)

@app.get("/health", tags=["Health"])
def health_check():
    db_alive = check_db_health()
    return {
        "status": "HEALTHY" if db_alive else "DEGRADED",
        "service": "AgroShield API",
        "database_connected": db_alive,
        "gemini_model": settings.GEMINI_MODEL,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "product": "AgroShield",
        "tagline": "Your Farm's Intelligent Protection System",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
