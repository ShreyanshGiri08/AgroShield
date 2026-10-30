from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.models.entities import (
    AgriculturalDocument, AgriculturalDocumentChunk, DocumentEmbedding
)
from backend.app.rag.embedder import generate_embedding

class AgriculturalRetriever:
    """Retrieves verified ICAR and university agricultural knowledge chunks using pgvector HNSW."""

    @staticmethod
    def search(
        query: str,
        db: Session,
        crop_name: Optional[str] = None,
        growth_stage: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Performs dense vector retrieval against agricultural_document_chunks using cosine similarity.
        Applies metadata filters where crop_name or growth_stage are provided.
        """
        query_vector = generate_embedding(query)
        vector_str = "[" + ",".join(f"{x:.6f}" for x in query_vector) + "]"

        # Direct SQL query utilizing the HNSW vector_cosine_ops index
        # 1 - (embedding <=> CAST(:query_vector AS vector)) computes cosine similarity
        sql = """
            SELECT 
                c.id as chunk_id,
                c.clean_text,
                c.page_number,
                c.crop_name,
                c.growth_stage,
                c.topic,
                d.title as doc_title,
                d.issuing_institution,
                d.source_url,
                (1 - (e.embedding <=> CAST(:query_vector AS vector))) as similarity_score
            FROM document_embeddings e
            JOIN agricultural_document_chunks c ON c.id = e.chunk_id
            JOIN agricultural_documents d ON d.id = c.document_id
            WHERE 1=1
        """
        params = {"query_vector": vector_str, "limit": top_k}

        if crop_name:
            sql += " AND (c.crop_name ILIKE :crop_name OR c.crop_name IS NULL)"
            params["crop_name"] = f"%{crop_name}%"

        sql += """
            ORDER BY e.embedding <=> CAST(:query_vector AS vector) ASC
            LIMIT :limit;
        """

        results = db.execute(text(sql), params).fetchall()

        evidence = []
        for r in results:
            evidence.append({
                "chunk_id": str(r.chunk_id),
                "text": r.clean_text,
                "page_number": r.page_number,
                "crop": r.crop_name,
                "stage": r.growth_stage,
                "topic": r.topic,
                "document_title": r.doc_title,
                "institution": r.issuing_institution,
                "source_url": r.source_url,
                "similarity": round(float(r.similarity_score), 3)
            })

        return evidence
