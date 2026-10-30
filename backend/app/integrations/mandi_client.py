import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

DATA_GOV_IN_MANDI_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

class MandiClient:
    """Client for Government of India data.gov.in AGMARKNET open agricultural market portal."""

    @staticmethod
    async def get_commodity_prices(state: str, district: Optional[str] = None, commodity: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
        """
        Retrieves authentic daily mandi arrival and modal prices from data.gov.in.
        Retains strict provenance, reporting date, and never invents prices.
        """
        api_key = settings.DATA_GOV_IN_API_KEY
        
        # Build query parameters
        params = {
            "format": "json",
            "limit": limit
        }
        if api_key:
            params["api-key"] = api_key
        if state:
            params["filters[state]"] = state
        if district:
            params["filters[district]"] = district
        if commodity:
            params["filters[commodity]"] = commodity

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(DATA_GOV_IN_MANDI_URL, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    records = data.get("records", [])
                    
                    parsed_records = []
                    for r in records:
                        parsed_records.append({
                            "state": r.get("state"),
                            "district": r.get("district"),
                            "market": r.get("market"),
                            "commodity": r.get("commodity"),
                            "variety": r.get("variety"),
                            "arrival_date": r.get("arrival_date"),
                            "min_price": float(r.get("min_price", 0)) if r.get("min_price") else None,
                            "max_price": float(r.get("max_price", 0)) if r.get("max_price") else None,
                            "modal_price": float(r.get("modal_price", 0)) if r.get("modal_price") else None,
                            "unit": "Rs/Quintal"
                        })
                    
                    return {
                        "status": "SUCCESS" if parsed_records else "NO_RECORDS",
                        "records_count": len(parsed_records),
                        "provenance": {
                            "source": "Open Government Data Platform India (data.gov.in / AGMARKNET)",
                            "endpoint": DATA_GOV_IN_MANDI_URL,
                            "retrieved_at": datetime.utcnow().isoformat(),
                            "filter_state": state,
                            "filter_district": district,
                            "filter_commodity": commodity
                        },
                        "records": parsed_records
                    }
                else:
                    return {
                        "status": "UNAVAILABLE",
                        "error_code": response.status_code,
                        "message": f"Government open-data portal responded with HTTP {response.status_code}",
                        "provenance": {
                            "source": "data.gov.in / AGMARKNET",
                            "retrieved_at": datetime.utcnow().isoformat()
                        },
                        "records": []
                    }
        except httpx.RequestError as exc:
            return {
                "status": "UNAVAILABLE",
                "message": f"Unable to reach data.gov.in market portal: {str(exc)}",
                "provenance": {
                    "source": "data.gov.in / AGMARKNET",
                    "retrieved_at": datetime.utcnow().isoformat()
                },
                "records": []
            }
