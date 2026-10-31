import urllib.request
import json
import ssl
from backend.app.core.config import settings

url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
payload = {
    "contents": [{"parts": [{"text": "Generate a JSON with keys title and summary in simple Hindi for cotton crop."}]}],
    "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
}
req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print("Success! HTTP status:", resp.status)
        print("Content:", data["candidates"][0]["content"]["parts"][0]["text"][:200])
except Exception as e:
    print("Gemini error:", e)
