from fastapi import APIRouter, HTTPException, Query
from backend.app.integrations.weather_client import WeatherClient

router = APIRouter(prefix="/api/weather", tags=["Live Weather Intelligence"])

@router.get("/live")
async def get_live_weather(
    latitude: float = Query(..., description="GPS Latitude"),
    longitude: float = Query(..., description="GPS Longitude")
):
    """
    Retrieves authentic, live micro-climate weather observation and 7-day forecast from Open-Meteo.
    Includes data source attribution and retrieval timestamp.
    """
    try:
        data = await WeatherClient.get_current_and_forecast(latitude, longitude)
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to reach Open-Meteo live weather service: {str(exc)}"
        )
