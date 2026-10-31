from datetime import date, datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import CropCatalog, CropGrowthStage, FarmCrop, RiskRuleDefinition

class CropRiskEngine:
    """
    Deterministic agronomic risk calculation engine.
    Calculates quantifiable agricultural exposure without LLM hallucinations.
    """

    @staticmethod
    def estimate_growth_stage(sowing_date: date, crop_id: Any, db: Session) -> Optional[CropGrowthStage]:
        """
        Calculates days-after-sowing (DAS) and finds corresponding growth stage in database schedule.
        """
        today = date.today()
        das = (today - sowing_date).days
        if das < 0:
            das = 0

        stages = (
            db.query(CropGrowthStage)
            .filter(CropGrowthStage.crop_id == crop_id)
            .order_by(CropGrowthStage.stage_order.asc())
            .all()
        )

        matched_stage = None
        for s in stages:
            if s.start_day_offset <= das <= s.end_day_offset:
                matched_stage = s
                break
        
        # If beyond maximum scheduled days, assign last maturity stage
        if not matched_stage and stages:
            matched_stage = stages[-1]

        return matched_stage

    @staticmethod
    def evaluate_risk(
        crop: CropCatalog,
        stage: Optional[CropGrowthStage],
        current_weather: Dict[str, Any],
        forecast_daily: List[Dict[str, Any]],
        db: Session,
        simulated_delta: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Deterministically evaluates environmental metrics against agronomic threshold rules.
        Supports counterfactual simulations via `simulated_delta` (e.g. {'rain_delta_mm': 20, 'temp_delta_c': 3}).
        """
        sim_delta = simulated_delta or {}
        rain_delta = sim_delta.get("rain_delta_mm", 0.0)
        temp_delta = sim_delta.get("temp_delta_c", 0.0)

        # 1. Compute environmental aggregates from forecast (next 3 to 7 days)
        forecast_3day = forecast_daily[:3] if forecast_daily else []
        
        max_rain_single_day = max(
            [(f.get("precipitation_sum_mm") or 0.0) + rain_delta for f in forecast_3day],
            default=0.0
        )
        total_forecast_rain = sum(
            [(f.get("precipitation_sum_mm") or 0.0) + rain_delta for f in forecast_3day]
        )
        max_forecast_temp = max(
            [(f.get("temp_max_c") or 0.0) + temp_delta for f in forecast_3day],
            default=current_weather.get("temperature_c", 25.0) + temp_delta
        )
        current_humidity = current_weather.get("relative_humidity_pct", 50.0)

        # 2. Fetch active rules for this crop and growth stage
        rules_query = db.query(RiskRuleDefinition).filter(
            RiskRuleDefinition.crop_id == crop.id,
            RiskRuleDefinition.is_active == True
        )
        if stage:
            rules_query = rules_query.filter(
                (RiskRuleDefinition.stage_id == stage.id) | (RiskRuleDefinition.stage_id == None)
            )
        rules = rules_query.all()

        triggered_factors = []
        base_score = 10.0  # Baseline low ambient risk

        for r in rules:
            val_to_check = None
            if r.condition_metric == "precipitation_sum_mm":
                val_to_check = max_rain_single_day
            elif r.condition_metric == "temp_max_c":
                val_to_check = max_forecast_temp
            elif r.condition_metric == "relative_humidity_pct":
                val_to_check = current_humidity

            if val_to_check is None:
                continue

            # Evaluate operator
            is_triggered = False
            if r.operator == ">=" and val_to_check >= float(r.threshold_value_min or 0):
                is_triggered = True
            elif r.operator == ">" and val_to_check > float(r.threshold_value_min or 0):
                is_triggered = True
            elif r.operator == "<=" and val_to_check <= float(r.threshold_value_min or 0):
                is_triggered = True
            elif r.operator == "<" and val_to_check < float(r.threshold_value_min or 0):
                is_triggered = True
            elif r.operator == "BETWEEN" and float(r.threshold_value_min or 0) <= val_to_check <= float(r.threshold_value_max or 999):
                is_triggered = True

            if is_triggered:
                severity_weight = {
                    "LOW": 15.0,
                    "MODERATE": 30.0,
                    "HIGH": 50.0,
                    "SEVERE": 70.0
                }.get(r.severity_level, 20.0)
                
                base_score += severity_weight
                triggered_factors.append({
                    "rule_code": r.rule_code,
                    "severity": r.severity_level,
                    "metric": r.condition_metric,
                    "observed_value": round(val_to_check, 2),
                    "threshold_applied": float(r.threshold_value_min or 0),
                    "rationale": r.rationale,
                    "citation": r.source_citation
                })

        # Cap score between 0 and 100
        risk_score = min(max(base_score, 5.0), 98.0)

        # Categorize
        if risk_score >= 70.0:
            risk_level = "SEVERE"
        elif risk_score >= 50.0:
            risk_level = "HIGH"
        elif risk_score >= 30.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 1),
            "crop_evaluated": crop.common_name,
            "stage_evaluated": stage.stage_name if stage else "General",
            "primary_factors": triggered_factors,
            "calculated_conditions": {
                "max_rain_single_day_mm": round(max_rain_single_day, 1),
                "total_forecast_rain_3d_mm": round(total_forecast_rain, 1),
                "max_forecast_temp_c": round(max_forecast_temp, 1),
                "relative_humidity_pct": round(current_humidity, 1)
            },
            "is_simulation": bool(simulated_delta),
            "simulated_delta": simulated_delta or {},
            "assessed_at": datetime.utcnow().isoformat(),
            "limitations": "Calculated deterministically from weather forecasts and ICAR agronomic thresholds. Actual field drainage and micro-climate may modify real impact."
        }
