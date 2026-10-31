import os
from typing import List
from pydantic import BaseModel, Field

class Settings(BaseModel):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    DATABASE_URL: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    DATA_GOV_IN_API_KEY: str = ""
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

def load_settings() -> Settings:
    data = {}
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip()
                    if k in Settings.model_fields:
                        data[k] = v
    # Also allow system environment variables override
    for k in Settings.model_fields:
        if k in os.environ and os.environ[k]:
            data[k] = os.environ[k]
    # Handle CORS_ORIGINS as comma-separated list
    if "CORS_ORIGINS" in data and isinstance(data["CORS_ORIGINS"], str):
        data["CORS_ORIGINS"] = [origin.strip() for origin in data["CORS_ORIGINS"].split(",") if origin.strip()]
    return Settings(**data)

settings = load_settings()
