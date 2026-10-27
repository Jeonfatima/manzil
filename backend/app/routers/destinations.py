from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Destination
from app.schemas import DestinationWithWeather, DestinationResponse, WeatherResponse
from app.services.weather import get_destination_weather

router = APIRouter(prefix="/destinations", tags=["Destinations"])

@router.get("", response_model=List[DestinationWithWeather])
@router.get("/", response_model=List[DestinationWithWeather])
async def get_destinations(session: Session = Depends(get_session)):
    destinations = session.exec(select(Destination)).all()
    
    result = []
    for dest in destinations:
        weather = await get_destination_weather(
            dest.name, latitude=dest.latitude, longitude=dest.longitude
        )
        result.append(
            {
                "id": dest.id,
                "name": dest.name,
                "province": dest.province,
                "avg_daily_budget_pkr": dest.avg_daily_budget_pkr,
                "latitude": dest.latitude,
                "longitude": dest.longitude,
                "description": dest.description,
                "image_url": dest.image_url,
                "optimal_seasons": dest.optimal_seasons,
                "best_hotels": dest.best_hotels,
                "food_specialties": dest.food_specialties,
                "popular_spots": dest.popular_spots,
                "weather": weather,
                "spot_rate": dest.spot_rate,
            }
        )
    return result

@router.get("/{destination_id}", response_model=DestinationResponse)
def get_destination(destination_id: int, session: Session = Depends(get_session)):
    dest = session.get(Destination, destination_id)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest

@router.get("/{destination_id}/weather")
async def get_weather(destination_id: int, session: Session = Depends(get_session)):
    dest = session.get(Destination, destination_id)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return await get_destination_weather(
        dest.name, latitude=dest.latitude, longitude=dest.longitude
    )
