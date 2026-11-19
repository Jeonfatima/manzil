import os
os.environ.setdefault("VERCEL", "1")

from app.database import init_db
from app.services.seed import seed_database

# Initialize DB and seed on cold start (runs once per serverless instance)
try:
    init_db()
    seed_database()
except Exception as e:
    print(f"Startup init warning: {e}")

from app.main import app
