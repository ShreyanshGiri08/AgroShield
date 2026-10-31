from fastapi import APIRouter, Query
from typing import Optional
from backend.app.integrations.mandi_client import MandiClient

router = APIRouter(prefix="/api/mandi", tags=["Market & Mandi Intelligence"])

@router.get("/prices")
async def get_mandi_prices(
    state: str = Query("Maharashtra", description="Indian State name"),
    district: Optional[str] = Query(None, description="District name"),
    commodity: Optional[str] = Query(None, description="Crop/Commodity name (e.g. Cotton, Wheat)"),
    limit: int = Query(25, ge=1, le=100)
):
    """
    Retrieves authentic daily commodity prices from data.gov.in AGMARKNET portal
    with instant fallback to verified multi-crop AGMARKNET benchmark data.
    """
    data = await MandiClient.get_commodity_prices(
        state=state,
        district=district,
        commodity=commodity,
        limit=limit
    )
    return data

@router.get("/predict")
def predict_mandi_price(
    commodity: str = Query("Cotton", description="Crop name"),
    modal_price: Optional[float] = Query(None, description="Current modal price (optional)"),
    state: str = Query("Maharashtra", description="State name")
):
    """
    Predictive Market Intelligence & Trend Analysis Endpoint.
    Returns:
    - 14-day projected modal prices with day-by-day forecast curve
    - Government Minimum Support Price (MSP) comparison benchmark
    - Actionable Sell vs. Hold advisory with agronomical reasoning
    """
    prediction = MandiClient.predict_commodity_price(
        commodity=commodity,
        current_modal=modal_price,
        state=state
    )
    return prediction
