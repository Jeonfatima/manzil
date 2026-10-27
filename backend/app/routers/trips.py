import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import Trip, Destination, Expense, User
from app.schemas import TripCreate, TripResponse, TripSaveRequest, TripUpdateRequest, ExpenseCreate, ExpenseResponse
from app.security import get_current_user
from app.services.llm import generate_itinerary_ai
from app.services.budget import calculate_budget_summary

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("/generate", response_model=TripResponse)
async def generate_trip(
    data: TripCreate,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    dest = session.get(Destination, data.destination_id)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    rates = None
    if dest.spot_rate:
        rates = {
            "hotel_budget_pkr": dest.spot_rate.hotel_budget_pkr,
            "hotel_standard_pkr": dest.spot_rate.hotel_standard_pkr,
            "hotel_luxury_pkr": dest.spot_rate.hotel_luxury_pkr,
            "daily_transport_pkr": dest.spot_rate.daily_transport_pkr,
            "daily_food_pkr": dest.spot_rate.daily_food_pkr,
            "spots_data": dest.spot_rate.spots_data,
        }

    itinerary_data = await generate_itinerary_ai(
        destination=dest.name,
        days=data.total_days,
        budget=data.total_budget,
        style=data.travel_style,
        start_date=data.start_date,
        spots=dest.popular_spots,
        rates=rates,
    )

    return {
        "id": None,
        "title": f"{data.total_days}-Day Trip to {dest.name}",
        "destination_id": dest.id,
        "total_days": data.total_days,
        "total_budget": data.total_budget,
        "travel_style": data.travel_style,
        "start_date": data.start_date,
        "itinerary": itinerary_data,
        "expenses": []
    }

@router.post("/save", response_model=TripResponse)
def save_trip(
    data: TripSaveRequest,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to save trips")
        
    dest = session.get(Destination, data.destination_id)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    trip = Trip(
        title=f"{data.total_days}-Day Trip to {dest.name}",
        destination_id=dest.id,
        user_id=current_user.id,
        total_days=data.total_days,
        total_budget=data.total_budget,
        travel_style=data.travel_style,
        start_date=data.start_date,
        itinerary_json=json.dumps(data.itinerary)
    )
    
    session.add(trip)
    session.commit()
    session.refresh(trip)

    return {
        "id": trip.id,
        "title": trip.title,
        "destination_id": trip.destination_id,
        "total_days": trip.total_days,
        "total_budget": trip.total_budget,
        "travel_style": trip.travel_style,
        "start_date": trip.start_date,
        "itinerary": data.itinerary,
        "expenses": []
    }

@router.get("/user/{user_id}", response_model=List[TripResponse])
def get_user_trips(user_id: int, session: Session = Depends(get_session)):
    trips = session.exec(
        select(Trip).where(Trip.user_id == user_id)
    ).all()
    
    res = []
    for t in trips:
        itinerary = json.loads(t.itinerary_json) if isinstance(t.itinerary_json, str) else t.itinerary_json
        res.append({
            "id": t.id,
            "title": t.title,
            "destination_id": t.destination_id,
            "total_days": t.total_days,
            "total_budget": t.total_budget,
            "travel_style": t.travel_style,
            "start_date": t.start_date,
            "itinerary": itinerary,
            "expenses": t.expenses or []
        })
    return res

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    return {
        "id": trip.id,
        "title": trip.title,
        "destination_id": trip.destination_id,
        "total_days": trip.total_days,
        "total_budget": trip.total_budget,
        "travel_style": trip.travel_style,
        "start_date": trip.start_date,
        "itinerary": json.loads(trip.itinerary_json),
        "expenses": trip.expenses
    }

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    data: TripUpdateRequest,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if current_user and trip.user_id and trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this trip")
    
    if data.title is not None:
        trip.title = data.title
    if data.total_budget is not None:
        trip.total_budget = data.total_budget
    if data.travel_style is not None:
        trip.travel_style = data.travel_style
    if data.start_date is not None:
        trip.start_date = data.start_date
    if data.itinerary is not None:
        trip.itinerary_json = json.dumps(data.itinerary)
        
    session.add(trip)
    session.commit()
    session.refresh(trip)
    
    return {
        "id": trip.id,
        "title": trip.title,
        "destination_id": trip.destination_id,
        "total_days": trip.total_days,
        "total_budget": trip.total_budget,
        "travel_style": trip.travel_style,
        "start_date": trip.start_date,
        "itinerary": json.loads(trip.itinerary_json) if isinstance(trip.itinerary_json, str) else trip.itinerary_json,
        "expenses": trip.expenses or []
    }

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, session: Session = Depends(get_session), current_user: Optional[User] = Depends(get_current_user)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if current_user is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this trip")
    session.delete(trip)
    session.commit()
    return {"status": "deleted"}

@router.post("/{trip_id}/expenses", response_model=ExpenseResponse)
def add_expense(trip_id: int, data: ExpenseCreate, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    expense = Expense(
        trip_id=trip_id,
        category=data.category,
        amount=data.amount,
        description=data.description,
        date=data.date
    )
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense

@router.get("/{trip_id}/budget-summary")
def get_budget_summary(trip_id: int, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return calculate_budget_summary(trip.total_budget, trip.expenses)
