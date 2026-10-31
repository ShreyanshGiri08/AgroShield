import os
import sys
from datetime import datetime, date, timedelta
from sqlalchemy import text
from backend.app.core.database import SessionLocal
from backend.app.models.entities import MandiMarket, MandiPrice, DataSourceRegistry

def seed_mandi_data():
    db = SessionLocal()
    try:
        # 1. Get or create data source
        source = db.query(DataSourceRegistry).filter(DataSourceRegistry.source_name.ilike("%data.gov.in%")).first()
        if not source:
            source = DataSourceRegistry(
                source_name="Open Government Data Platform India (data.gov.in)",
                source_type="MANDI_API",
                endpoint_or_url="https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
                attribution_text="AGMARKNET daily agricultural commodity market prices Directorate of Marketing & Inspection"
            )
            db.add(source)
            db.commit()
            db.refresh(source)
        source_id = source.id

        # 2. Comprehensive Mandi Markets Directory across key agricultural belts
        market_specs = [
            # Maharashtra
            {"name": "APMC Akola", "district": "Akola", "state": "Maharashtra", "lat": 20.7002, "lon": 77.0082},
            {"name": "APMC Barshitakli", "district": "Akola", "state": "Maharashtra", "lat": 20.5796, "lon": 77.0543},
            {"name": "APMC Murtizapur", "district": "Akola", "state": "Maharashtra", "lat": 20.7323, "lon": 77.3621},
            {"name": "APMC Amravati", "district": "Amravati", "state": "Maharashtra", "lat": 20.9374, "lon": 77.7796},
            {"name": "APMC Nagpur", "district": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882},
            {"name": "APMC Jalgaon", "district": "Jalgaon", "state": "Maharashtra", "lat": 21.0077, "lon": 75.5626},
            {"name": "APMC Nashik", "district": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lon": 73.7898},
            {"name": "APMC Pune", "district": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567},
            {"name": "APMC Latur", "district": "Latur", "state": "Maharashtra", "lat": 18.4088, "lon": 76.5604},
            # Madhya Pradesh
            {"name": "APMC Indore", "district": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577},
            {"name": "APMC Ujjain", "district": "Ujjain", "state": "Madhya Pradesh", "lat": 23.1765, "lon": 75.7885},
            {"name": "APMC Bhopal", "district": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126},
            {"name": "APMC Dewas", "district": "Dewas", "state": "Madhya Pradesh", "lat": 22.9676, "lon": 76.0534},
            # Punjab & Haryana
            {"name": "APMC Khanna", "district": "Ludhiana", "state": "Punjab", "lat": 30.7071, "lon": 76.2167},
            {"name": "APMC Ludhiana", "district": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lon": 75.8573},
            {"name": "APMC Karnal", "district": "Karnal", "state": "Haryana", "lat": 29.6857, "lon": 76.9905},
            # Gujarat
            {"name": "APMC Rajkot", "district": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lon": 70.8022},
            {"name": "APMC Surat", "district": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311},
            # Uttar Pradesh
            {"name": "APMC Kanpur", "district": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319},
            {"name": "APMC Agra", "district": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081},
            # Rajasthan
            {"name": "APMC Kota", "district": "Kota", "state": "Rajasthan", "lat": 25.2138, "lon": 75.8648},
            {"name": "APMC Jaipur", "district": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873},
        ]

        market_map = {}
        for m in market_specs:
            exist = db.query(MandiMarket).filter(
                MandiMarket.market_name == m["name"],
                MandiMarket.district == m["district"],
                MandiMarket.state == m["state"]
            ).first()
            if not exist:
                exist = MandiMarket(
                    market_name=m["name"],
                    district=m["district"],
                    state=m["state"],
                    latitude=m["lat"],
                    longitude=m["lon"],
                    is_active=True
                )
                db.add(exist)
                db.commit()
                db.refresh(exist)
            market_map[f"{m['state']}_{m['district']}_{m['name']}"] = exist.id

        today = date.today()

        # 3. Comprehensive Mandi Price Catalog for ALL Crops
        # Covering Cotton, Soybean, Wheat, Rice (Paddy), Chickpea (Gram), Maize, Sugarcane, Mustard, Potato, Onion
        price_catalog = [
            # ─── COTTON ───
            ("Maharashtra", "Akola", "APMC Akola", "Cotton", "Bt Cotton (Medium Staple)", 7150.0, 7750.0, 7550.0),
            ("Maharashtra", "Akola", "APMC Barshitakli", "Cotton", "Bt Cotton", 7080.0, 7600.0, 7420.0),
            ("Maharashtra", "Akola", "APMC Murtizapur", "Cotton", "Long Staple", 7250.0, 7850.0, 7620.0),
            ("Maharashtra", "Amravati", "APMC Amravati", "Cotton", "Bt Hybrid", 7200.0, 7700.0, 7500.0),
            ("Maharashtra", "Nagpur", "APMC Nagpur", "Cotton", "DCH-32", 7300.0, 7920.0, 7680.0),
            ("Maharashtra", "Jalgaon", "APMC Jalgaon", "Cotton", "Bt Cotton", 7100.0, 7650.0, 7450.0),
            ("Gujarat", "Rajkot", "APMC Rajkot", "Cotton", "Shankar-6", 7400.0, 8100.0, 7820.0),
            ("Madhya Pradesh", "Dewas", "APMC Dewas", "Cotton", "Medium Staple", 7050.0, 7550.0, 7380.0),

            # ─── SOYBEAN ───
            ("Maharashtra", "Akola", "APMC Akola", "Soybean", "Yellow JS-335", 4600.0, 5050.0, 4880.0),
            ("Maharashtra", "Akola", "APMC Barshitakli", "Soybean", "Yellow", 4550.0, 4980.0, 4810.0),
            ("Maharashtra", "Amravati", "APMC Amravati", "Soybean", "JS-9305", 4650.0, 5120.0, 4920.0),
            ("Maharashtra", "Latur", "APMC Latur", "Soybean", "Yellow Grade-1", 4700.0, 5200.0, 5010.0),
            ("Maharashtra", "Nagpur", "APMC Nagpur", "Soybean", "Commercial", 4580.0, 5020.0, 4850.0),
            ("Madhya Pradesh", "Indore", "APMC Indore", "Soybean", "Yellow Premium", 4750.0, 5250.0, 5060.0),
            ("Madhya Pradesh", "Ujjain", "APMC Ujjain", "Soybean", "Yellow", 4680.0, 5140.0, 4950.0),
            ("Madhya Pradesh", "Dewas", "APMC Dewas", "Soybean", "JS-335", 4620.0, 5080.0, 4890.0),

            # ─── WHEAT ───
            ("Maharashtra", "Akola", "APMC Akola", "Wheat", "Lokwan / Sharbati", 2800.0, 3450.0, 3180.0),
            ("Maharashtra", "Akola", "APMC Murtizapur", "Wheat", "Mill Quality", 2650.0, 2950.0, 2820.0),
            ("Maharashtra", "Nagpur", "APMC Nagpur", "Wheat", "Sharbati", 2900.0, 3600.0, 3350.0),
            ("Madhya Pradesh", "Indore", "APMC Indore", "Wheat", "Malavraj Sharbati", 3100.0, 3850.0, 3520.0),
            ("Madhya Pradesh", "Bhopal", "APMC Bhopal", "Wheat", "Lokwan", 2750.0, 3200.0, 3050.0),
            ("Punjab", "Ludhiana", "APMC Khanna", "Wheat", "PBW-502 / HD-2967", 2350.0, 2600.0, 2480.0),
            ("Punjab", "Ludhiana", "APMC Ludhiana", "Wheat", "HD-3086", 2380.0, 2650.0, 2510.0),
            ("Haryana", "Karnal", "APMC Karnal", "Wheat", "DBW-187", 2400.0, 2680.0, 2530.0),
            ("Uttar Pradesh", "Kanpur", "APMC Kanpur", "Wheat", "Desi Sharbati", 2550.0, 2950.0, 2780.0),

            # ─── RICE (PADDY) ───
            ("Maharashtra", "Nagpur", "APMC Nagpur", "Rice", "HMT Rice / Sona Masoori", 3200.0, 4100.0, 3750.0),
            ("Maharashtra", "Pune", "APMC Pune", "Rice", "Indrayani", 3400.0, 4300.0, 3950.0),
            ("Maharashtra", "Akola", "APMC Akola", "Rice", "Common Paddy", 2250.0, 2550.0, 2400.0),
            ("Punjab", "Ludhiana", "APMC Khanna", "Rice", "Basmati 1121", 3800.0, 4650.0, 4280.0),
            ("Punjab", "Ludhiana", "APMC Ludhiana", "Rice", "PR-126 Paddy", 2280.0, 2450.0, 2370.0),
            ("Haryana", "Karnal", "APMC Karnal", "Rice", "Pusa 1509 Basmati", 3600.0, 4400.0, 4050.0),
            ("Uttar Pradesh", "Kanpur", "APMC Kanpur", "Rice", "Common Paddy", 2250.0, 2480.0, 2360.0),

            # ─── CHICKPEA (GRAM / CHANA) ───
            ("Maharashtra", "Akola", "APMC Akola", "Chickpea", "Desi Chana (Vijay)", 5600.0, 6250.0, 5980.0),
            ("Maharashtra", "Akola", "APMC Barshitakli", "Chickpea", "Chana", 5550.0, 6150.0, 5890.0),
            ("Maharashtra", "Amravati", "APMC Amravati", "Chickpea", "Digvijay Desi", 5650.0, 6300.0, 6020.0),
            ("Maharashtra", "Latur", "APMC Latur", "Chickpea", "Kabuli Dollar Chana", 7800.0, 9200.0, 8550.0),
            ("Madhya Pradesh", "Indore", "APMC Indore", "Chickpea", "Dollar Kabuli", 8200.0, 9600.0, 8950.0),
            ("Madhya Pradesh", "Ujjain", "APMC Ujjain", "Chickpea", "Kantawala Chana", 5700.0, 6400.0, 6100.0),
            ("Rajasthan", "Kota", "APMC Kota", "Chickpea", "Desi Chana", 5500.0, 6180.0, 5920.0),

            # ─── MAIZE (MAKKA) ───
            ("Maharashtra", "Akola", "APMC Akola", "Maize", "Yellow Hybrid", 2150.0, 2480.0, 2320.0),
            ("Maharashtra", "Jalgaon", "APMC Jalgaon", "Maize", "Pioneer Yellow", 2200.0, 2550.0, 2390.0),
            ("Maharashtra", "Nashik", "APMC Nashik", "Maize", "Feed Grade Yellow", 2180.0, 2500.0, 2350.0),
            ("Madhya Pradesh", "Dewas", "APMC Dewas", "Maize", "Yellow Maize", 2120.0, 2420.0, 2280.0),
            ("Rajasthan", "Kota", "APMC Kota", "Maize", "Desi Makka", 2160.0, 2460.0, 2310.0),
            ("Uttar Pradesh", "Kanpur", "APMC Kanpur", "Maize", "Yellow Grain", 2100.0, 2400.0, 2260.0),

            # ─── SUGARCANE ───
            ("Maharashtra", "Pune", "APMC Pune", "Sugarcane", "Co-86032", 335.0, 385.0, 360.0),
            ("Maharashtra", "Nashik", "APMC Nashik", "Sugarcane", "Co-0265", 330.0, 380.0, 355.0),
            ("Uttar Pradesh", "Agra", "APMC Agra", "Sugarcane", "Co-0238", 345.0, 395.0, 370.0),
            ("Karnataka", "Belgaum", "APMC Pune", "Sugarcane", "Sugar Variety", 340.0, 390.0, 365.0),

            # ─── MUSTARD (SARSON) ───
            ("Rajasthan", "Jaipur", "APMC Jaipur", "Mustard", "Pusa Bold 42% Oil", 5550.0, 6200.0, 5920.0),
            ("Rajasthan", "Kota", "APMC Kota", "Mustard", "Black Mustard", 5450.0, 6080.0, 5820.0),
            ("Haryana", "Karnal", "APMC Karnal", "Mustard", "Yellow Mustard", 5600.0, 6300.0, 6010.0),
            ("Madhya Pradesh", "Bhopal", "APMC Bhopal", "Mustard", "Raya", 5400.0, 6000.0, 5760.0),
            ("Uttar Pradesh", "Agra", "APMC Agra", "Mustard", "Desi Sarson", 5500.0, 6150.0, 5880.0),
            ("Maharashtra", "Akola", "APMC Akola", "Mustard", "Sarson", 5400.0, 5950.0, 5720.0),

            # ─── POTATO (ALOO) ───
            ("Uttar Pradesh", "Agra", "APMC Agra", "Potato", "Kufri Bahar", 1350.0, 1750.0, 1550.0),
            ("Uttar Pradesh", "Kanpur", "APMC Kanpur", "Potato", "Kufri Jyoti", 1400.0, 1800.0, 1600.0),
            ("Maharashtra", "Pune", "APMC Pune", "Potato", "Local Red", 1600.0, 2100.0, 1880.0),
            ("Maharashtra", "Akola", "APMC Akola", "Potato", "Table Potato", 1500.0, 1950.0, 1720.0),

            # ─── ONION (PYAZ) ───
            ("Maharashtra", "Nashik", "APMC Nashik", "Onion", "Lasalgaon Red", 2200.0, 3100.0, 2680.0),
            ("Maharashtra", "Pune", "APMC Pune", "Onion", "Garva Summer Onion", 2150.0, 2950.0, 2590.0),
            ("Maharashtra", "Akola", "APMC Akola", "Onion", "Red Onion", 2050.0, 2800.0, 2450.0),
            ("Madhya Pradesh", "Indore", "APMC Indore", "Onion", "Malwa Red", 2100.0, 2850.0, 2520.0),
        ]

        inserted_count = 0
        updated_count = 0

        for state_val, dist_val, mkt_val, crop_val, variety_val, min_p, max_p, mod_p in price_catalog:
            key = f"{state_val}_{dist_val}_{mkt_val}"
            m_id = market_map.get(key)
            if not m_id:
                continue

            existing_price = db.query(MandiPrice).filter(
                MandiPrice.market_id == m_id,
                MandiPrice.commodity == crop_val,
                MandiPrice.arrival_date == today
            ).first()

            if existing_price:
                existing_price.variety = variety_val
                existing_price.min_price = min_p
                existing_price.max_price = max_p
                existing_price.modal_price = mod_p
                updated_count += 1
            else:
                new_price = MandiPrice(
                    market_id=m_id,
                    commodity=crop_val,
                    variety=variety_val,
                    arrival_date=today,
                    min_price=min_p,
                    max_price=max_p,
                    modal_price=mod_p,
                    unit="Rs/Quintal",
                    source_id=source_id
                )
                db.add(new_price)
                inserted_count += 1

        db.commit()
        print(f"[SUCCESS] Mandi Data Seeded! Inserted: {inserted_count}, Updated: {updated_count}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Mandi Seeding failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_mandi_data()
