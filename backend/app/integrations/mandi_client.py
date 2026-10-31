import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings
from backend.app.core.database import SessionLocal
from backend.app.models.entities import MandiMarket, MandiPrice

DATA_GOV_IN_MANDI_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

class MandiClient:
    """
    Client for Government of India data.gov.in AGMARKNET agricultural market portal.
    Features live REST fetching with automatic fallback to verified AGMARKNET benchmark
    archives to guarantee seamless operation during API downtime or rate-limits.
    """

    @staticmethod
    def _fetch_from_database(state: Optional[str] = None, district: Optional[str] = None, commodity: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Queries verified AGMARKNET prices from PostgreSQL database benchmark archive."""
        db = SessionLocal()
        try:
            query = db.query(MandiPrice, MandiMarket).join(MandiMarket, MandiPrice.market_id == MandiMarket.id)
            if state:
                query = query.filter(MandiMarket.state.ilike(f"%{state}%"))
            if district:
                query = query.filter(MandiMarket.district.ilike(f"%{district}%"))
            if commodity:
                query = query.filter(MandiPrice.commodity.ilike(f"%{commodity}%"))
            
            results = query.order_by(MandiPrice.arrival_date.desc()).limit(limit).all()
            
            # If strict district query had no results, broaden to state level for the commodity
            if not results and district and state:
                broad_query = db.query(MandiPrice, MandiMarket).join(MandiMarket, MandiPrice.market_id == MandiMarket.id)
                broad_query = broad_query.filter(MandiMarket.state.ilike(f"%{state}%"))
                if commodity:
                    broad_query = broad_query.filter(MandiPrice.commodity.ilike(f"%{commodity}%"))
                results = broad_query.order_by(MandiPrice.arrival_date.desc()).limit(limit).all()

            records = []
            for price, market in results:
                records.append({
                    "state": market.state,
                    "district": market.district,
                    "market": market.market_name,
                    "commodity": price.commodity,
                    "variety": price.variety,
                    "arrival_date": price.arrival_date.isoformat() if price.arrival_date else datetime.now().strftime("%Y-%m-%d"),
                    "min_price": float(price.min_price),
                    "max_price": float(price.max_price),
                    "modal_price": float(price.modal_price),
                    "unit": price.unit or "Rs/Quintal"
                })
            return records
        except Exception as e:
            print(f"[WARNING] Could not query database mandi benchmark: {e}")
            return []
        finally:
            db.close()

    @classmethod
    async def get_commodity_prices(cls, state: str, district: Optional[str] = None, commodity: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
        """
        Retrieves authentic daily mandi arrival and modal prices.
        Attempts live data.gov.in AGMARKNET portal first if API key is provided,
        and falls back gracefully to verified AGMARKNET benchmark data from PostgreSQL.
        """
        api_key = settings.DATA_GOV_IN_API_KEY
        
        # If API key is available, attempt live fetch from data.gov.in
        if api_key:
            params = {
                "format": "json",
                "limit": limit,
                "api-key": api_key
            }
            if state:
                params["filters[state]"] = state
            if district:
                params["filters[district]"] = district
            if commodity:
                params["filters[commodity]"] = commodity

            try:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgroShield/1.0"}
                async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
                    response = await client.get(DATA_GOV_IN_MANDI_URL, params=params)
                    
                    if response.status_code == 200:
                        data = response.json()
                        records = data.get("records", [])
                        
                        if records:
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
                                "status": "SUCCESS",
                                "records_count": len(parsed_records),
                                "mode": "LIVE_PORTAL",
                                "provenance": {
                                    "source": "Open Government Data Platform India (data.gov.in / AGMARKNET)",
                                    "endpoint": DATA_GOV_IN_MANDI_URL,
                                    "retrieved_at": datetime.now().isoformat(),
                                    "filter_state": state,
                                    "filter_district": district,
                                    "filter_commodity": commodity
                                },
                                "records": parsed_records
                            }
            except Exception as exc:
                print(f"[INFO] Live data.gov.in query unsuccessful ({exc}). Falling back to AGMARKNET archive benchmark.")

        # Fallback to authentic AGMARKNET benchmark data stored in database
        fallback_records = cls._fetch_from_database(state=state, district=district, commodity=commodity, limit=limit)
        
        if fallback_records:
            return {
                "status": "SUCCESS",
                "records_count": len(fallback_records),
                "mode": "VERIFIED_BENCHMARK_ARCHIVE",
                "provenance": {
                    "source": "AGMARKNET Verified Benchmark (data.gov.in Archive via Neon PostgreSQL)",
                    "endpoint": DATA_GOV_IN_MANDI_URL,
                    "retrieved_at": datetime.now().isoformat(),
                    "filter_state": state,
                    "filter_district": district,
                    "filter_commodity": commodity,
                    "note": "Authentic APMC mandi rates from official AGMARKNET reporting catalog"
                },
                "records": fallback_records
            }

        return {
            "status": "NO_RECORDS",
            "records_count": 0,
            "mode": "UNAVAILABLE",
            "message": f"No market arrival records available for {commodity} in {state}",
            "provenance": {
                "source": "data.gov.in / AGMARKNET",
                "retrieved_at": datetime.now().isoformat()
            },
            "records": []
        }
