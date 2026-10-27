from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "online"}

def test_destinations_with_weather():
    r = client.get("/api/destinations")
    assert r.status_code == 200
    destinations = r.json()
    assert len(destinations) >= 8

    # Verify fields required by spec
    for d in destinations:
        assert "name" in d
        assert "province" in d
        assert "avg_daily_budget_pkr" in d
        assert "latitude" in d
        assert "longitude" in d
        assert "description" in d
        assert "image_url" in d
        assert "popular_spots" in d
        assert "weather" in d
        assert d["weather"] is not None
        assert "temp" in d["weather"]
        assert "condition" in d["weather"]

def test_trip_generation():
    dests = client.get("/api/destinations").json()
    dest = dests[0]

    payload = {
        "destination_id": dest["id"],
        "total_days": 4,
        "total_budget": 80000,
        "travel_style": "High Adventure",
        "start_date": "2026-06-15",
    }
    r = client.post("/api/trips/generate", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "itinerary" in data
    itinerary = data["itinerary"]
    assert "starting_hub" in itinerary
    assert "recommended_hotel" in itinerary
    assert "daily_plan" in itinerary
    assert len(itinerary["daily_plan"]) == 4
    assert "cost_breakdown" in itinerary
    cb = itinerary["cost_breakdown"]
    assert "stay_pkr" in cb
    assert "meals_pkr" in cb
    assert "transport_pkr" in cb

def test_auth_and_trip_saving_and_retrieval():
    # 1. Register or login user
    email = "testtraveler@manzil.com"
    pwd = "SecurePassword123!"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Test Traveler"
    })
    if reg_res.status_code == 200:
        token = reg_res.json()["access_token"]
        user_id = reg_res.json()["user"]["id"]
    else:
        login_res = client.post("/api/auth/login", json={
            "email": email,
            "password": pwd
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        user_id = login_res.json()["user"]["id"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Generate and then save trip
    dests = client.get("/api/destinations").json()
    dest = dests[0]
    gen_res = client.post("/api/trips/generate", json={
        "destination_id": dest["id"],
        "total_days": 3,
        "total_budget": 60000,
        "travel_style": "Family Relaxation",
        "start_date": "2026-07-01",
    }).json()

    save_payload = {
        "destination_id": dest["id"],
        "total_days": 3,
        "total_budget": 60000,
        "travel_style": "Family Relaxation",
        "start_date": "2026-07-01",
        "itinerary": gen_res["itinerary"],
    }
    save_res = client.post("/api/trips/save", json=save_payload, headers=headers)
    assert save_res.status_code == 200
    saved_trip = save_res.json()
    trip_id = saved_trip["id"]
    assert trip_id is not None

    # 3. Retrieve user trips
    user_trips_res = client.get(f"/api/trips/user/{user_id}", headers=headers)
    assert user_trips_res.status_code == 200
    trips = user_trips_res.json()
    assert any(t["id"] == trip_id for t in trips)

    # 4. Get single trip
    single_res = client.get(f"/api/trips/{trip_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["id"] == trip_id

    # 4b. Update trip itinerary
    updated_itinerary = gen_res["itinerary"]
    updated_itinerary["daily_plan"][0]["title"] = "Updated Custom Theme for Day 1"
    update_res = client.put(f"/api/trips/{trip_id}", json={
        "title": "Modified 3-Day Journey",
        "itinerary": updated_itinerary
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Modified 3-Day Journey"
    assert update_res.json()["itinerary"]["daily_plan"][0]["title"] == "Updated Custom Theme for Day 1"

    # 5. Delete trip
    del_res = client.delete(f"/api/trips/{trip_id}", headers=headers)
    assert del_res.status_code == 200

def test_musafir_ai_chat():
    r = client.post("/api/ai/chat", json={
        "query": "What is the best route to Hunza from Islamabad?",
        "destination_context": "Hunza Valley"
    })
    assert r.status_code == 200
    reply = r.json()["reply"]
    assert len(reply) > 20
