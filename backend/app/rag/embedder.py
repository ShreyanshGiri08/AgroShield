import numpy as np
from typing import List, Union

_model_instance = None

def get_embedder():
    """Lazy loader for SentenceTransformer to optimize startup latency."""
    global _model_instance
    if _model_instance is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Runs locally on CPU with zero paid API costs, producing 384-dim dense vectors
            _model_instance = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            print(f"[WARNING] Could not load SentenceTransformer: {e}")
            return None
    return _model_instance

def generate_embedding(text: str) -> List[float]:
    """Generates a 384-dimensional normalized vector for a given query or document text."""
    embedder = get_embedder()
    if embedder is not None:
        embedding = embedder.encode(text, normalize_embeddings=True)
        return embedding.tolist()
    # Deterministic fallback pseudo-vector if sentence-transformers is still compiling
    import hashlib
    hasher = hashlib.sha256(text.encode("utf-8")).digest()
    raw = [float(b) / 255.0 for b in hasher]
    repeated = (raw * 12)[:384]
    norm = np.linalg.norm(repeated) or 1.0
    return (np.array(repeated) / norm).tolist()
