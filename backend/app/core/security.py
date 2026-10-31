import hashlib
import secrets

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(stored_password_hash: str, provided_password: str) -> bool:
    """Verifies a plain-text password against a stored PBKDF2-HMAC-SHA256 hash."""
    if not stored_password_hash or "$" not in stored_password_hash:
        return False
    try:
        salt, key_hex = stored_password_hash.split("$", 1)
        new_key = hashlib.pbkdf2_hmac(
            "sha256",
            provided_password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        )
        return secrets.compare_digest(key_hex, new_key.hex())
    except Exception:
        return False

