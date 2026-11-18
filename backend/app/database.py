from sqlmodel import SQLModel, create_engine, Session, text
from app.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)
    if "sqlite" in settings.DATABASE_URL:
        with engine.connect() as conn:
            try:
                res = conn.execute(text("PRAGMA table_info(destination)")).fetchall()
                existing_cols = {row[1] for row in res}
                if existing_cols:
                    if "optimal_seasons" not in existing_cols:
                        conn.execute(text("ALTER TABLE destination ADD COLUMN optimal_seasons VARCHAR DEFAULT 'May - October'"))
                    if "best_hotels" not in existing_cols:
                        conn.execute(text("ALTER TABLE destination ADD COLUMN best_hotels VARCHAR DEFAULT 'Serena, Luxus, PTDC Motel'"))
                    if "food_specialties" not in existing_cols:
                        conn.execute(text("ALTER TABLE destination ADD COLUMN food_specialties VARCHAR DEFAULT 'Traditional Karahi, Chapshuro, Trout Fish'"))
                    conn.commit()
            except Exception as e:
                print(f"Database migration notice: {e}")

def get_session():
    with Session(engine) as session:
        yield session
