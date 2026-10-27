import httpx
from app.config import settings

FALLBACK_WEATHER = {
    "Hunza Valley": {"temp": 16, "condition": "Sunny", "forecast": [{"day": "Tomorrow", "temp": 18, "condition": "Clear"}, {"day": "Day 3", "temp": 14, "condition": "Partly Cloudy"}]},
    "Skardu": {"temp": 12, "condition": "Breezy", "forecast": [{"day": "Tomorrow", "temp": 13, "condition": "Clear"}, {"day": "Day 3", "temp": 11, "condition": "Cloudy"}]},
    "Swat Valley": {"temp": 21, "condition": "Clear", "forecast": [{"day": "Tomorrow", "temp": 22, "condition": "Sunny"}, {"day": "Day 3", "temp": 20, "condition": "Rain Showers"}]},
    "Neelum Valley": {"temp": 15, "condition": "Partly Cloudy", "forecast": [{"day": "Tomorrow", "temp": 16, "condition": "Sunny"}, {"day": "Day 3", "temp": 14, "condition": "Light Rain"}]},
}

async def get_destination_weather(destination_name: str, latitude: float = None, longitude: float = None) -> dict:
    """
    Fetches real-time live weather and 5-day forecast from OpenWeatherMap API
    using the stored destination coordinates (falls back to place-name lookup).
    Falls back to intelligent regional mock data if API key is missing or request fails.
    """
    api_key = settings.OPENWEATHER_API_KEY
    
    if api_key and api_key.strip():
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {}
                if latitude is not None and longitude is not None:
                    params["lat"] = latitude
                    params["lon"] = longitude
                else:
                    params["q"] = f"{destination_name},PK"
                
                current_res = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={**params, "units": "metric", "appid": api_key}
                )
                
                forecast_res = await client.get(
                    "https://api.openweathermap.org/data/2.5/forecast",
                    params={**params, "units": "metric", "appid": api_key}
                )
                
                if current_res.status_code == 200:
                    curr_data = current_res.json()
                    temp = round(curr_data["main"]["temp"])
                    condition = curr_data["weather"][0]["main"]
                    
                    forecast_list = []
                    if forecast_res.status_code == 200:
                        f_data = forecast_res.json()
                        items = f_data.get("list", [])
                        # Group 3-hourly entries into per-day buckets
                        by_day: dict = {}
                        for item in items:
                            dt_txt = item.get("dt_txt", "")
                            day_key = dt_txt.split(" ")[0] if dt_txt else "Day 1"
                            if day_key not in by_day:
                                by_day[day_key] = item
                        days_picked = sorted(by_day.items())[:5]
                        for i, (day_key, item) in enumerate(days_picked):
                            forecast_list.append({
                                "day": f"Day {i + 1}" if i > 0 else "Tomorrow",
                                "temp": round(item["main"]["temp"]),
                                "condition": item["weather"][0]["main"]
                            })

                    # Fallback forecast if parsing list is empty
                    if not forecast_list:
                        forecast_list = [
                            {"day": "Tomorrow", "temp": temp + 1, "condition": condition},
                            {"day": "Day 3", "temp": temp - 1, "condition": "Clear"}
                        ]

                    return {
                        "temp": temp,
                        "condition": condition,
                        "forecast": forecast_list
                    }
        except Exception as e:
            print(f"Weather API Error: {e}")

    # Fallback dictionary if no API key or network error occurs
    return FALLBACK_WEATHER.get(destination_name, {
        "temp": 20, 
        "condition": "Pleasant", 
        "forecast": [
            {"day": "Tomorrow", "temp": 22, "condition": "Sunny"}, 
            {"day": "Day 3", "temp": 19, "condition": "Clear"}
        ]
    })
