from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Trip
from app.schemas import UserResponse, TripResponse
from app.security import get_current_user
import json

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

@router.get("/me/trips", response_model=List[TripResponse])
def get_user_trips(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    statement = select(Trip).where(Trip.user_id == current_user.id)
    trips = session.exec(statement).all()
    
    res = []
    for t in trips:
        res.append({
            "id": t.id,
            "title": t.title,
            "destination_id": t.destination_id,
            "total_days": t.total_days,
            "total_budget": t.total_budget,
            "travel_style": t.travel_style,
            "start_date": t.start_date,
            "itinerary": json.loads(t.itinerary_json),
            "expenses": t.expenses
        })
    return res