import os
import sys
from urllib.parse import urlparse
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("[ERROR] DATABASE_URL environment variable is missing.")
    sys.exit(1)

print("[INFO] Connecting to PostgreSQL database...")
try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    print("[SUCCESS] Connected successfully to PostgreSQL!")
    
    # 1. Check extensions
    print("[INFO] Verifying extensions...")
    cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    cur.execute("CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";")
    try:
        cur.execute("CREATE EXTENSION IF NOT EXISTS \"vector\";")
        print("[SUCCESS] pgvector extension verified.")
    except Exception as e:
        print(f"[WARNING] Could not enable pgvector: {e}")
    
    # 2. Read schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")
    print(f"[INFO] Reading schema from {schema_path}...")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    
    print("[INFO] Executing schema.sql on Neon database...")
    cur.execute(schema_sql)
    print("[SUCCESS] Schema executed successfully!")
    
    # 3. Verification query
    cur.execute("""
        SELECT 
            (SELECT COUNT(*) FROM crop_catalog) as crops_seeded,
            (SELECT COUNT(*) FROM crop_growth_stages) as stages_seeded,
            (SELECT COUNT(*) FROM risk_rule_definitions) as risk_rules_seeded,
            (SELECT COUNT(*) FROM data_source_registry) as sources_seeded;
    """)
    row = cur.fetchone()
    print(f"[VERIFICATION] Crops: {row[0]}, Growth Stages: {row[1]}, Risk Rules: {row[2]}, Data Sources: {row[3]}")
    
    # 4. List created tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [r[0] for r in cur.fetchall()]
    print(f"[SUCCESS] Total Tables Created: {len(tables)}")
    print(f"[TABLES] {', '.join(tables)}")

    cur.close()
    conn.close()
    print("[COMPLETE] Database initialization and verification successful!")

except Exception as err:
    print(f"[ERROR] Database operation failed: {err}")
    sys.exit(1)
