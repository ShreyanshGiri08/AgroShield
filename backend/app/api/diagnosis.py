import base64
import json
import urllib.request
import ssl
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.config import settings

router = APIRouter(prefix="/api/diagnosis", tags=["Multimodal Crop Inspection"])

@router.post("/image")
async def analyze_crop_image(
    file: UploadFile = File(...),
    crop_name: str = Form("Cotton"),
    location: str = Form("Akola, Maharashtra"),
    language: str = Form("hi")
):
    """
    Multimodal crop inspection using Gemini Vision.
    Analyzes leaf abnormalities and returns visible symptoms, precautions, and legal uncertainty disclaimer.
    """
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are supported.")

    file_bytes = await file.read()
    b64_image = base64.b64encode(file_bytes).decode("utf-8")

    prompt = f"""
You are Farmarian, the AI Farm Guardian for AgroShield.
Inspect this photograph of a {crop_name} crop from {location}.

TASK:
1. Carefully observe visible signs on the leaf/plant: discolorations, lesions, curling, holes, moisture issues.
2. Formulate 2-3 possible agronomic causes (e.g. sucking pests like thrips/aphids, fungal blight, nutrient deficiency).
3. Provide cautious, practical precautionary steps (cultural practices, botanical sprays, neem oil, field sanitation).
4. Strictly respond in {language.upper()} (e.g. Hindi if 'hi').
5. Output strictly JSON matching this schema:
{{
  "visible_symptoms": ["Symptom 1 in language", "Symptom 2"],
  "possible_causes": [
    {{"cause": "Name of disease/pest", "likelihood": "HIGH / MODERATE / LOW", "description": "Brief explanation"}}
  ],
  "recommended_precautions": [
    "Precaution 1 (e.g. neem oil spray / clean drainage)",
    "Precaution 2"
  ],
  "uncertainty_disclaimer": "महत्वपूर्ण सूचना: यह विश्लेषण केवल प्राथमिक मार्गदर्शन के लिए है। किसी भी रासायनिक कीटनाशक के प्रयोग से पहले स्थानीय कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से पुष्टि अवश्य करें।"
}}
"""

    key = settings.GEMINI_API_KEY
    model = settings.GEMINI_MODEL
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": file.content_type,
                            "data": b64_image
                        }
                    }
                ]
            }
        ],
        "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
    }

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            text_out = res["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text_out)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Multimodal inspection failed: {str(exc)}"
        )
