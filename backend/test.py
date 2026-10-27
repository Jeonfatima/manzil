import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
BASE_URL = "http://127.0.0.1:8000"

def test_openweather_api_direct():
    print("\n--- 1. Testing OpenWeatherMap API Direct Key ---")
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_api_key_here":
        print("❌ OpenWeather API Key is missing in .env file!")
        return

    # Hunza coordinates (Lat: 36.3167, Lon: 74.6500)
    url = f"https://api.openweathermap.org/data/2.5/weather?lat=36.3167&lon=74.6500&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            temp = data["main"]["temp"]
            condition = data["weather"][0]["main"]
            print(f"✅ OpenWeather API Working! Live Temp in Hunza: {temp}°C ({condition})")
        else:
            print(f"❌ OpenWeather API Failed! Status Code: {res.status_code}, Error: {res.text}")
    except Exception as e:
        print(f"❌ OpenWeather API Exception: {e}")

def test_gemini_api_direct():
    print("\n--- 2. Testing Google Gemini API Direct Key ---")
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        print("❌ Gemini API Key is missing in .env file!")
        return

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Give a 1-sentence welcome message for a traveler visiting Hunza, Pakistan.")
        print("✅ Gemini API Working! Response:")
        print(f"  \"{response.text.strip()}\"")
    except Exception as e:
        print(f"❌ Gemini API Failed! Error: {e}")

def test_fastapi_backend_endpoints():
    print("\n--- 3. Testing Full FastAPI Integration Endpoints ---")
    
    # Test Destinations Route
    try:
        res = requests.get(f"{BASE_URL}/api/destinations")
        if res.status_code == 200:
            destinations = res.json()
            print(f"✅ /api/destinations works! Fetched {len(destinations)} destinations.")
            if len(destinations) > 0:
                print(f"   Sample Weather Data via Backend: {destinations[0].get('weather')}")
        else:
            print(f"❌ /api/destinations returned status {res.status_code}")
    except Exception as e:
        print(f"❌ Backend server issue on /api/destinations: {e}")

    # Test Trip Generation Route
    payload = {
        "destination_id": 1,
        "total_days": 3,
        "total_budget": 60000,
        "travel_style": "Adventure",
        "start_date": "2026-06-01"
    }
    try:
        res = requests.post(f"{BASE_URL}/api/trips/generate", json=payload)
        if res.status_code == 200:
            trip_data = res.json()
            print("✅ /api/trips/generate works! Trip generated successfully.")
            print("\n--- Itinerary Output Preview ---")
            itinerary = trip_data.get('itinerary', '')
            print(itinerary[:250] + "..." if len(itinerary) > 250 else itinerary)
        else:
            print(f"❌ /api/trips/generate returned status {res.status_code}")
    except Exception as e:
        print(f"❌ Backend server issue on /api/trips/generate: {e}")

if __name__ == "__main__":
    print("🚀 Starting Complete API Diagnostics (Gemini + Weather + Backend)...")
    test_openweather_api_direct()
    test_gemini_api_direct()
    test_fastapi_backend_endpoints()
    print("\n✨ All Diagnostic Tests Completed!")