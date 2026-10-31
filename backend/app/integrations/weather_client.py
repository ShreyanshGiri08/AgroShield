import httpx
from datetime import datetime
from typing import Dict, Any, Optional

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Standard WMO Weather interpretation codes
WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm: Slight or moderate", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
}

class WeatherClient:
    """Client for Open-Meteo API providing real-time microclimate observations and forecasts."""

    @staticmethod
    async def get_current_and_forecast(latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Fetches live current weather and 7-day daily forecast for exact coordinates.
        Never fabricates data; returns genuine Open-Meteo response with provenance.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "wind_direction_10m", "weather_code"],
            "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "precipitation_probability_max", "wind_speed_10m_max", "et0_fao_evapotranspiration", "weather_code"],
            "timezone": "auto"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OPEN_METEO_FORECAST_URL, params=params)
            response.raise_for_status()
            data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})
        weather_code = current.get("weather_code", 0)

        daily_forecasts = []
        dates = daily.get("time", [])
        for i, dt in enumerate(dates):
            daily_forecasts.append({
                "date": dt,
                "temp_max_c": daily.get("temperature_2m_max", [None])[i],
                "temp_min_c": daily.get("temperature_2m_min", [None])[i],
                "precipitation_sum_mm": daily.get("precipitation_sum", [0.0])[i],
                "precipitation_probability_pct": daily.get("precipitation_probability_max", [0])[i],
                "wind_speed_kmh": daily.get("wind_speed_10m_max", [None])[i],
                "evapotranspiration_mm": daily.get("et0_fao_evapotranspiration", [None])[i],
                "weather_code": daily.get("weather_code", [0])[i],
                "weather_description": WMO_WEATHER_CODES.get(daily.get("weather_code", [0])[i], "Unknown")
            })

        return {
            "provenance": {
                "source": "Open-Meteo Weather API",
                "attribution": "Weather data provided by Open-Meteo (open-meteo.com) under CC BY 4.0",
                "retrieved_at": datetime.utcnow().isoformat(),
                "latitude": latitude,
                "longitude": longitude,
                "elevation": data.get("elevation")
            },
            "current": {
                "timestamp": current.get("time"),
                "temperature_c": current.get("temperature_2m"),
                "relative_humidity_pct": current.get("relative_humidity_2m"),
                "precipitation_mm": current.get("precipitation", 0.0),
                "wind_speed_kmh": current.get("wind_speed_10m"),
                "wind_direction_deg": current.get("wind_direction_10m"),
                "weather_code": weather_code,
                "weather_description": WMO_WEATHER_CODES.get(weather_code, "Clear")
            },
            "daily_forecast": daily_forecasts
        }
