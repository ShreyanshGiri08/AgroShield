from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from backend.app.core.database import get_db
from backend.app.core.security import hash_password, verify_password
from backend.app.models.entities import User, FarmerProfile, Farm, FarmCrop, CropCatalog

router = APIRouter(prefix="/api/farmers", tags=["Farmers & Farm Context"])

class CropItemInput(BaseModel):
    crop_name: str = Field(..., example="Cotton")
    variety_name: Optional[str] = Field(None, example="Bt Cotton (Hybrid)")
    sowing_date: date = Field(..., example="2026-08-15")
    status: Optional[str] = Field("ACTIVE", example="ACTIVE")

class FarmerRegistrationRequest(BaseModel):
    phone_number: str = Field(..., example="9876543210")
    password: str = Field(..., min_length=4, example="farmer@123")
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
    # Support multiple crops list
    crops: Optional[List[CropItemInput]] = None
    # Backwards compatibility single crop
    crop_name: Optional[str] = None
    sowing_date: Optional[date] = None

class FarmerLoginRequest(BaseModel):
    phone_number: str = Field(..., example="9876543210")
    password: str = Field(..., example="farmer@123")

def _build_farmer_response(user: User, profile: Optional[FarmerProfile], farm: Optional[Farm], db: Session):
    crops_data = []
    if farm and farm.crops:
        for fc in farm.crops:
            crop_meta = fc.crop
            crops_data.append({
                "id": str(fc.id),
                "name": crop_meta.common_name if crop_meta else "Crop",
                "hindi_name": crop_meta.hindi_name if crop_meta else (crop_meta.common_name if crop_meta else "फसल"),
                "variety": fc.variety_name or "",
                "sowing_date": str(fc.sowing_date) if fc.sowing_date else "",
                "status": fc.current_status or "ACTIVE",
            })

    # Default active crop (first one or fallback)
    primary_crop = crops_data[0] if crops_data else {
        "id": None,
        "name": "Cotton",
        "hindi_name": "कपास",
        "variety": "",
        "sowing_date": str(date.today()),
        "status": "ACTIVE"
    }

    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "preferred_language": user.preferred_language,
        "has_password": user.password_hash is not None,
        "location": {
            "state": profile.state if profile else None,
            "district": profile.district if profile else None,
            "village": profile.village if profile else None,
            "latitude": float(profile.latitude) if profile else 20.7002,
            "longitude": float(profile.longitude) if profile else 77.0082,
        },
        "farm": {
            "name": farm.farm_name if farm else "Main Farm",
            "area_acres": float(farm.area_acres) if farm else 5.0,
            "soil_type": farm.soil_type if farm else "Black Soil",
            "irrigation_source": farm.irrigation_source if farm else "Borewell",
        },
        "crops": crops_data,
        "crop": primary_crop,
    }

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
    """Registers a new farmer with password protection and 1 or more crops."""
    clean_phone = req.phone_number.strip().replace(" ", "").replace("-", "")

    # 1. Check if user already exists
    user = db.query(User).filter(User.phone_number == clean_phone).first()
    if user:
        # If user exists and already has a password, reject duplicate registration
        if user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A farmer with this phone number is already registered. Please login with your password."
            )
        # Update user details and set password
        user.full_name = req.full_name
        user.preferred_language = req.preferred_language
        user.password_hash = hash_password(req.password)
        db.commit()
    else:
        user = User(
            phone_number=clean_phone,
            password_hash=hash_password(req.password),
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
        profile.village = req.village
        db.commit()

    # 3. Create or update Farm
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
    else:
        farm.area_acres = req.area_acres
        farm.soil_type = req.soil_type
        farm.irrigation_source = req.irrigation_source
        db.commit()

    # 4. Bind Multiple Crops
    input_crops: List[CropItemInput] = []
    if req.crops and len(req.crops) > 0:
        input_crops = req.crops
    elif req.crop_name and req.sowing_date:
        input_crops = [CropItemInput(crop_name=req.crop_name, sowing_date=req.sowing_date)]
    else:
        # Default fallback to Cotton
        input_crops = [CropItemInput(crop_name="Cotton", sowing_date=date.today())]

    # Clear old crops if re-registering or ensure crops exist
    for c_in in input_crops:
        # find matching catalog crop
        matched_crop = db.query(CropCatalog).filter(
            CropCatalog.common_name.ilike(f"%{c_in.crop_name}%")
        ).first()
        if not matched_crop:
            matched_crop = db.query(CropCatalog).filter(
                CropCatalog.hindi_name.ilike(f"%{c_in.crop_name}%")
            ).first()
        if not matched_crop:
            matched_crop = db.query(CropCatalog).first()

        # Check if already bound to this farm
        existing_fc = db.query(FarmCrop).filter(
            FarmCrop.farm_id == farm.id,
            FarmCrop.crop_id == matched_crop.id
        ).first()

        if not existing_fc:
            fc = FarmCrop(
                farm_id=farm.id,
                crop_id=matched_crop.id,
                variety_name=c_in.variety_name,
                sowing_date=c_in.sowing_date,
                current_status="ACTIVE"
            )
            db.add(fc)
        else:
            existing_fc.sowing_date = c_in.sowing_date
            if c_in.variety_name:
                existing_fc.variety_name = c_in.variety_name

    db.commit()
    db.refresh(farm)

    return _build_farmer_response(user, profile, farm, db)

@router.post("/login")
def login_farmer(req: FarmerLoginRequest, db: Session = Depends(get_db)):
    """Authenticates farmer using phone number and password."""
    clean_phone = req.phone_number.strip().replace(" ", "").replace("-", "")
    user = db.query(User).filter(User.phone_number == clean_phone).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please register first."
        )

    # If the user has a password set, verify it
    if user.password_hash:
        if not verify_password(user.password_hash, req.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please verify your credentials."
            )
    else:
        # Legacy user without password - set their password on this login attempt
        user.password_hash = hash_password(req.password)
        db.commit()

    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    farm = db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first() if profile else None

    return _build_farmer_response(user, profile, farm, db)

@router.post("/{user_id}/add-crop")
def add_crop_to_farmer(user_id: str, crop_input: CropItemInput, db: Session = Depends(get_db)):
    """Dynamically adds an additional crop to the farmer's active farm."""
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    farm = db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm holding not found")

    # Match catalog crop
    matched_crop = db.query(CropCatalog).filter(
        CropCatalog.common_name.ilike(f"%{crop_input.crop_name}%")
    ).first()
    if not matched_crop:
        matched_crop = db.query(CropCatalog).filter(
            CropCatalog.hindi_name.ilike(f"%{crop_input.crop_name}%")
        ).first()
    if not matched_crop:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_input.crop_name}' is not in the agricultural catalog.")

    new_fc = FarmCrop(
        farm_id=farm.id,
        crop_id=matched_crop.id,
        variety_name=crop_input.variety_name,
        sowing_date=crop_input.sowing_date,
        current_status="ACTIVE"
    )
    db.add(new_fc)
    db.commit()
    db.refresh(farm)

    user = db.query(User).filter(User.id == user_id).first()
    return _build_farmer_response(user, profile, farm, db)

@router.get("/{phone_number}")
def get_farmer_profile(phone_number: str, db: Session = Depends(get_db)):
    """Retrieves full farm context by phone number."""
    clean_phone = phone_number.strip().replace(" ", "").replace("-", "")
    user = db.query(User).filter(User.phone_number == clean_phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="Farmer not found")

    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    farm = db.query(Farm).filter(Farm.farmer_profile_id == profile.id).first() if profile else None

    return _build_farmer_response(user, profile, farm, db)
