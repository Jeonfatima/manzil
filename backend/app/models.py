from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field, Relationship

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str
    created_at: datetime = Field(default_factory=get_utc_now)
    
    trips: List["Trip"] = Relationship(back_populates="user")

class Destination(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    province: str
    avg_daily_budget_pkr: float
    latitude: float
    longitude: float
    description: str
    image_url: str
    optimal_seasons: Optional[str] = "May - October"
    best_hotels: Optional[str] = "Serena, Luxus, PTDC Motel"
    food_specialties: Optional[str] = "Traditional Karahi, Chapshuro, Trout Fish"
    popular_spots: List[str] = Field(
        default_factory=list, sa_column=Column("popular_spots", JSON)
    )

    spot_rate: Optional["SpotRate"] = Relationship(back_populates="destination")

class SpotRate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    destination_id: int = Field(foreign_key="destination.id", unique=True)
    hotel_budget_pkr: float = Field(default=4000.0)
    hotel_standard_pkr: float = Field(default=10000.0)
    hotel_luxury_pkr: float = Field(default=28000.0)
    daily_transport_pkr: float = Field(default=5000.0)
    daily_food_pkr: float = Field(default=2500.0)
    spots_data: List[Dict[str, Any]] = Field(
        default_factory=list, sa_column=Column("spots_data", JSON)
    )

    destination: Optional[Destination] = Relationship(back_populates="spot_rate")

class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    destination_id: int = Field(foreign_key="destination.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    total_days: int
    total_budget: float
    travel_style: str
    start_date: str
    itinerary_json: str
    created_at: datetime = Field(default_factory=get_utc_now)

    user: Optional[User] = Relationship(back_populates="trips")
    expenses: List["Expense"] = Relationship(back_populates="trip")

class Expense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trip_id: int = Field(foreign_key="trip.id")
    category: str
    amount: float
    description: str
    date: str

    trip: Trip = Relationship(back_populates="expenses")
