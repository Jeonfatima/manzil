from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.services.seed import seed_database
from app.routers import auth, destinations, trips, users, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_database()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(destinations.router, prefix="/api")
app.include_router(trips.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/api/health")
def read_health():
    return {"status": "online"}

@app.get("/api")
def read_root():
    return {"status": "online", "message": "Welcome to Manzil.com Travel API"}
