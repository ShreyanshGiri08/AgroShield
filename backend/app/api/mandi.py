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
    Retrieves authentic, live daily commodity prices from data.gov.in AGMARKNET portal.
    Never invents mock prices; returns transparent availability and reporting date.
    """
    data = await MandiClient.get_commodity_prices(
        state=state,
        district=district,
        commodity=commodity,
        limit=limit
    )
    return data
