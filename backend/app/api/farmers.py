from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from backend.app.core.database import get_db
from backend.app.models.entities import User, FarmerProfile, Farm, FarmCrop, CropCatalog, CropGrowthStage

router = APIRouter(prefix="/api/farmers", tags=["Farmers & Farm Context"])

class FarmerRegistrationRequest(BaseModel):
    phone_number: str = Field(..., example="9876543210")
    full_name: str = Field(..., example="Ramesh Patel")
    preferred_language: str = Field("hi", example="hi")
    state: str = Field(..., example="Maharashtra")
    district: str = Field(..., example="Akola")
    village: str = Field(..., example="Barshitakli")
    latitude: float = Field(..., example=20.7002)
    longitude: float = Field(..., example=77.0082)
    farm_name: str = Field("Main Farm", example="Main Farm")
    area_acres: float = Field(5.0, example=5.0)
    soil_type: Optional[str] = Field("Black Soil", example="Black Soil")
    irrigation_source: Optional[str] = Field("Borewell", example="Borewell")
    crop_name: str = Field("Cotton", example="Cotton")
    sowing_date: date = Field(..., example="2026-08-15")

@router.get("/crops")
def list_supported_crops(db: Session = Depends(get_db)):
    """Returns official catalog of Indian crops and their phenological parameters."""
    crops = db.query(CropCatalog).all()
    return [
        {
            "id": str(c.id),
            "common_name": c.common_name,
            "hindi_name": c.hindi_name,
            "category": c.crop_category,
            "season": c.season,
            "standard_duration_days": c.standard_duration_days
        }
        for c in crops
    ]

@router.post("/register")
def register_farmer(req: FarmerRegistrationRequest, db: Session = Depends(get_db)):
    """Registers a new farmer, location profile, farm holding, and initial active crop."""
    # 1. Check or create user
    user = db.query(User).filter(User.phone_number == req.phone_number).first()
    if not user:
        user = User(
            phone_number=req.phone_number,
            full_name=req.full_name,
            preferred_language=req.preferred_language
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Check or create profile
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    if not profile:
        profile = FarmerProfile(
            user_id=user.id,
            state=req.state,
            district=req.district,
            village=req.village,
            latitude=req.latitude,
            longitude=req.longitude
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        profile.latitude = req.latitude
        profile.longitude = req.longitude
        profile.district = req.district
        profile.state = req.state
        db.commit()

    # 3. Create Farm
    farm = db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first()
    if not farm:
        farm = Farm(
            farmer_profile_id=profile.id,
            farm_name=req.farm_name,
            area_acres=req.area_acres,
            soil_type=req.soil_type,
            irrigation_source=req.irrigation_source,
            latitude=req.latitude,
            longitude=req.longitude
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)

    # 4. Bind Crop
    crop = db.query(CropCatalog).filter(CropCatalog.common_name.ilike(f"%{req.crop_name}%")).first()
    if not crop:
        crop = db.query(CropCatalog).first()

    farm_crop = db.query(FarmCrop).filter(FarmCrop.farm_id == farm.id).first()
    if not farm_crop:
        farm_crop = FarmCrop(
            farm_id=farm.id,
            crop_id=crop.id,
            sowing_date=req.sowing_date,
            current_status="ACTIVE"
        )
        db.add(farm_crop)
        db.commit()
        db.refresh(farm_crop)

    return {
        "status": "SUCCESS",
        "user_id": str(user.id),
        "farmer_name": user.full_name,
        "phone_number": user.phone_number,
        "location": f"{profile.village}, {profile.district}, {profile.state}",
        "crop": crop.common_name,
        "sowing_date": str(farm_crop.sowing_date)
    }

@router.get("/{phone_number}")
def get_farmer_profile(phone_number: str, db: Session = Depends(get_db)):
    """Retrieves full farm context by phone number."""
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="Farmer not found")

    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    farm = db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first() if profile else None
    farm_crop = db.query(FarmCrop).filter(FarmCrop.farm_id == farm.id).first() if farm else None

    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "preferred_language": user.preferred_language,
        "location": {
            "state": profile.state if profile else None,
            "district": profile.district if profile else None,
            "village": profile.village if profile else None,
            "latitude": float(profile.latitude) if profile else None,
            "longitude": float(profile.longitude) if profile else None
        },
        "farm": {
            "name": farm.farm_name if farm else None,
            "area_acres": float(farm.area_acres) if farm else None,
            "soil_type": farm.soil_type if farm else None,
            "irrigation_source": farm.irrigation_source if farm else None
        },
        "crop": {
            "name": farm_crop.crop.common_name if farm_crop else None,
            "hindi_name": farm_crop.crop.hindi_name if farm_crop else None,
            "sowing_date": str(farm_crop.sowing_date) if farm_crop else None,
            "status": farm_crop.current_status if farm_crop else None
        }
    }
