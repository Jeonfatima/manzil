from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Destination Schemas
class SpotRateResponse(BaseModel):
    id: int
    destination_id: int
    hotel_budget_pkr: float
    hotel_standard_pkr: float
    hotel_luxury_pkr: float
    daily_transport_pkr: float
    daily_food_pkr: float
    spots_data: List[Any] = []

class DestinationResponse(BaseModel):
    id: int
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
    popular_spots: List[str] = []
    spot_rate: Optional[SpotRateResponse] = None

# Weather nested schema
class WeatherForecastItem(BaseModel):
    day: str
    temp: int
    condition: str

class WeatherResponse(BaseModel):
    temp: int
    condition: str
    forecast: List[WeatherForecastItem] = []

class DestinationWithWeather(DestinationResponse):
    weather: Optional[WeatherResponse] = None

# Trip Schemas
class TripCreate(BaseModel):
    destination_id: int
    total_days: int
    total_budget: float
    travel_style: str
    start_date: str

class TripSaveRequest(BaseModel):
    destination_id: int
    total_days: int
    total_budget: float
    travel_style: str
    start_date: str
    itinerary: Any

class TripUpdateRequest(BaseModel):
    title: Optional[str] = None
    total_budget: Optional[float] = None
    travel_style: Optional[str] = None
    start_date: Optional[str] = None
    itinerary: Optional[Any] = None

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: str
    date: str

class ExpenseResponse(BaseModel):
    id: int
    trip_id: int
    category: str
    amount: float
    description: str
    date: str

class TripResponse(BaseModel):
    id: Optional[int] = None
    title: str
    destination_id: int
    total_days: int
    total_budget: float
    travel_style: str
    start_date: str
    itinerary: Any
    expenses: List[ExpenseResponse] = []

# AI Request
class AIChatRequest(BaseModel):
    query: str
    destination_context: Optional[str] = None
