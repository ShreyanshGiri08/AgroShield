from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from backend.app.core.database import get_db
from backend.app.models.entities import CropCatalog, CropGrowthStage
from backend.app.risk_engine.calculator import CropRiskEngine
from backend.app.integrations.weather_client import WeatherClient

router = APIRouter(prefix="/api/risk", tags=["Deterministic Risk Engine & Scenarios"])

class ScenarioRequest(BaseModel):
    crop_name: str = Field("Cotton", example="Cotton")
    growth_stage_name: Optional[str] = Field("Flowering & Boll Formation", example="Flowering & Boll Formation")
    latitude: float = Field(20.7002, example=20.7002)
    longitude: float = Field(77.0082, example=77.0082)
    delta_rain_mm: float = Field(0.0, description="Hypothetical added/reduced rainfall in mm", example=30.0)
    delta_temp_c: float = Field(0.0, description="Hypothetical added/reduced temperature in °C", example=3.0)

@router.post("/evaluate")
async def evaluate_crop_risk(
    crop_name: str,
    growth_stage_name: Optional[str] = None,
    latitude: float = 20.7002,
    longitude: float = 77.0082,
    db: Session = Depends(get_db)
):
    """Evaluates deterministic crop risk using live weather and agronomic threshold rules."""
    crop = db.query(CropCatalog).filter(CropCatalog.common_name.ilike(f"%{crop_name}%")).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found in catalog")

    stage = None
    if growth_stage_name:
        stage = db.query(CropGrowthStage).filter(
            CropGrowthStage.crop_id == crop.id,
            CropGrowthStage.stage_name.ilike(f"%{growth_stage_name}%")
        ).first()

    weather = await WeatherClient.get_current_and_forecast(latitude, longitude)

    result = CropRiskEngine.evaluate_risk(
        crop=crop,
        stage=stage,
        current_weather=weather["current"],
        forecast_daily=weather["daily_forecast"],
        db=db
    )
    return result

@router.post("/scenario")
async def simulate_scenario(req: ScenarioRequest, db: Session = Depends(get_db)):
    """
    Reruns the deterministic crop risk engine against modified counterfactual variables.
    Clearly tags the output as a hypothetical simulation.
    """
    crop = db.query(CropCatalog).filter(CropCatalog.common_name.ilike(f"%{req.crop_name}%")).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop '{req.crop_name}' not found")

    stage = None
    if req.growth_stage_name:
        stage = db.query(CropGrowthStage).filter(
            CropGrowthStage.crop_id == crop.id,
            CropGrowthStage.stage_name.ilike(f"%{req.growth_stage_name}%")
        ).first()

    weather = await WeatherClient.get_current_and_forecast(req.latitude, req.longitude)

    # 1. Baseline assessment
    baseline = CropRiskEngine.evaluate_risk(
        crop=crop,
        stage=stage,
        current_weather=weather["current"],
        forecast_daily=weather["daily_forecast"],
        db=db
    )

    # 2. Simulated scenario
    simulated = CropRiskEngine.evaluate_risk(
        crop=crop,
        stage=stage,
        current_weather=weather["current"],
        forecast_daily=weather["daily_forecast"],
        db=db,
        simulated_delta={
            "rain_delta_mm": req.delta_rain_mm,
            "temp_delta_c": req.delta_temp_c
        }
    )

    return {
        "status": "SCENARIO_SIMULATION_COMPLETED",
        "notice": "This is a counterfactual 'what-if' simulation based on deterministic agronomic rules, not an official meteorological forecast.",
        "baseline": {
            "risk_level": baseline["risk_level"],
            "risk_score": baseline["risk_score"]
        },
        "scenario": {
            "risk_level": simulated["risk_level"],
            "risk_score": simulated["risk_score"],
            "applied_delta": {
                "delta_rain_mm": req.delta_rain_mm,
                "delta_temp_c": req.delta_temp_c
            },
            "primary_factors": simulated["primary_factors"],
            "calculated_conditions": simulated["calculated_conditions"]
        },
        "risk_delta_score": round(simulated["risk_score"] - baseline["risk_score"], 1)
    }
