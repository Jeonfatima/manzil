import json
import re
from typing import Optional, Dict, Any, List
import google.generativeai as genai
from app.config import settings

STYLE_LABELS = {
    "Budget": "Budget Explorer",
    "Budget Explorer": "Budget Explorer",
    "Family": "Family Relaxation",
    "Family Relaxation": "Family Relaxation",
    "Luxury": "Luxury Retreat",
    "Luxury Retreat": "Luxury Retreat",
    "Adventure": "High Adventure",
    "High Adventure": "High Adventure",
}

if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Failed to configure Gemini SDK: {e}")

def generate_itinerary_prompt(
    destination: str,
    days: int,
    budget: float,
    style: str,
    start_date: str = "2026-06-01",
    spots: Optional[List[str]] = None,
    rates: Optional[Dict[str, Any]] = None,
) -> str:
    spots_str = ", ".join(spots) if spots else "Regional landmarks, scenic viewpoints, local bazaars"
    rate_context = ""
    if rates:
        rate_context = f"""
Regional Rate Estimates (PKR):
- Budget Hotel: PKR {rates.get('hotel_budget_pkr', 4000):,.0f}/night
- Standard Hotel: PKR {rates.get('hotel_standard_pkr', 9500):,.0f}/night
- Luxury Hotel: PKR {rates.get('hotel_luxury_pkr', 25000):,.0f}/night
- Daily Transport (4x4 Jeep / Hiace): PKR {rates.get('daily_transport_pkr', 5000):,.0f}/day
- Daily Meals per person: PKR {rates.get('daily_food_pkr', 2200):,.0f}/day
"""

    return f"""
Generate an authentic, highly detailed {days}-day travel itinerary for {destination}, Pakistan.
Total Travel Budget: PKR {budget:,.0f}
Travel Style: {style}
Start Date: {start_date}
Key Regional Spots to include: {spots_str}
{rate_context}

Respond STRICTLY with valid JSON. Do not include markdown code fence formatting or extra text outside the JSON.
JSON format:
{{
  "starting_hub": "Islamabad / Regional Airport or Transit Hub",
  "recommended_hotel": "Hotel Name (PKR X,XXX/night)",
  "cost_breakdown": {{
    "stay_pkr": 30000,
    "meals_pkr": 15000,
    "transport_pkr": 20000,
    "activities_pkr": 8000,
    "total_estimated_pkr": 73000
  }},
  "daily_plan": [
    {{
      "day": 1,
      "title": "Day title theme",
      "activities": [
        {{"time": "08:30 AM", "title": "Spot or Activity Name", "duration": "2.5 hours", "cost": 1500, "details": "Detailed travel description"}},
        {{"time": "01:00 PM", "title": "Lunch spot", "duration": "1.5 hours", "cost": 1800, "details": "Traditional local meal"}}
      ]
    }}
  ]
}}
"""

async def generate_itinerary_ai(
    destination: str,
    days: int,
    budget: float,
    style: str,
    start_date: str = "2026-06-01",
    spots: Optional[List[str]] = None,
    rates: Optional[Dict[str, Any]] = None,
) -> dict:
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_free_gemini_api_key_here":
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = generate_itinerary_prompt(destination, days, budget, style, start_date, spots, rates)
            response = model.generate_content(prompt)
            clean_text = response.text.strip()
            # Remove any markdown code fences if present
            clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text, flags=re.MULTILINE)
            clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.MULTILINE).strip()
            parsed = json.loads(clean_text)
            if "daily_plan" in parsed and isinstance(parsed["daily_plan"], list):
                # Ensure cost_breakdown is present
                if "cost_breakdown" not in parsed:
                    daily_budget = budget / days
                    parsed["cost_breakdown"] = {
                        "stay_pkr": int(daily_budget * 0.4 * days),
                        "meals_pkr": int(daily_budget * 0.25 * days),
                        "transport_pkr": int(daily_budget * 0.25 * days),
                        "activities_pkr": int(daily_budget * 0.1 * days),
                        "total_estimated_pkr": int(budget),
                    }
                return parsed
        except Exception as e:
            print(f"Gemini generation failed, falling back to local regional engine: {e}")

    # Grounded Regional Fallback Engine using database rates
    label = STYLE_LABELS.get(style, style)
    daily_budget = budget / max(1, days)

    # Compute realistic costs grounded in SpotRate database rates
    hotel_cost_per_night = (
        rates.get("hotel_luxury_pkr", 25000) if "Luxury" in style else
        rates.get("hotel_budget_pkr", 4000) if "Budget" in style else
        rates.get("hotel_standard_pkr", 9000)
    ) if rates else daily_budget * 0.4

    transport_cost_per_day = rates.get("daily_transport_pkr", daily_budget * 0.25) if rates else daily_budget * 0.25
    food_cost_per_day = rates.get("daily_food_pkr", daily_budget * 0.2) if rates else daily_budget * 0.2
    activities_cost_per_day = max(500, daily_budget - (hotel_cost_per_night + transport_cost_per_day + food_cost_per_day))

    total_stay = int(hotel_cost_per_night * days)
    total_transport = int(transport_cost_per_day * days)
    total_meals = int(food_cost_per_day * days)
    total_activities = int(activities_cost_per_day * days)
    total_est = total_stay + total_transport + total_meals + total_activities

    cost_breakdown = {
        "stay_pkr": total_stay,
        "meals_pkr": total_meals,
        "transport_pkr": total_transport,
        "activities_pkr": total_activities,
        "total_estimated_pkr": total_est,
    }

    spot_list = spots if spots and len(spots) > 0 else [
        "Local Historic Fort",
        "Scenic Alpine Lake",
        "Mountain Pass Viewpoint",
        "Traditional Valley Bazaar",
        "Glacial Stream Trail"
    ]

    hotel_name = (
        f"Serena {destination} Resort" if "Luxury" in style else
        f"PTDC Alpine Lodge {destination}" if "Family" in style else
        f"Karakoram Backpackers Inn {destination}"
    )

    daily_plan = []
    for d in range(1, days + 1):
        spot_idx = (d - 1) % len(spot_list)
        spot_name = spot_list[spot_idx]

        daily_plan.append({
            "day": d,
            "title": f"Exploring {spot_name} - {label} (Day {d})",
            "activities": [
                {
                    "time": "08:30 AM",
                    "title": f"Morning Expedition to {spot_name}",
                    "duration": "3.5 Hours",
                    "cost": int(activities_cost_per_day * 0.6),
                    "details": f"Guided tour and photography around {spot_name}. Enjoy crisp mountain air and panoramic Karakoram/Himalayan vistas."
                },
                {
                    "time": "01:00 PM",
                    "title": "Authentic Local Lunch Experience",
                    "duration": "1.5 Hours",
                    "cost": int(food_cost_per_day * 0.5),
                    "details": f"Sample freshly caught local trout, traditional Chapshuro, or hot Shinwari mutton karahi with fresh naan."
                },
                {
                    "time": "04:30 PM",
                    "title": "Sunset Viewpoint & Regional Handicraft Bazaar",
                    "duration": "2.5 Hours",
                    "cost": int(activities_cost_per_day * 0.4),
                    "details": f"Watch the alpine glow on mountain ridges and browse traditional dry fruits, handmade wool shawls, and gemstones."
                }
            ]
        })

    return {
        "starting_hub": "Islamabad International Airport / Karakoram Gateway Hub",
        "recommended_hotel": f"{hotel_name} (PKR {int(hotel_cost_per_night):,}/night)",
        "cost_breakdown": cost_breakdown,
        "daily_plan": daily_plan
    }

async def answer_musafir_query(query: str, context: str = "") -> str:
    # 1. If real Gemini API key is configured in backend/.env, call Google Gemini 1.5 Flash
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and settings.GEMINI_API_KEY != "your_free_gemini_api_key_here":
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""You are Musafir.ai, an elite Pakistani travel assistant and mountaineering guide for Northern Pakistan.
Answer warmly, professionally, and accurately in English with a touch of Urdu hospitality (Assalam-o-Alaikum, Insha'Allah, etc.).
Provide realistic, detailed advice on routes, famous spots, mountain roads, local seasons, hotels, safety, and Pakistani Rupee (PKR) budgeting.
Destination Context: {context}
User Query: {query}"""
            res = model.generate_content(prompt)
            if res.text and res.text.strip():
                return res.text.strip()
        except Exception as e:
            print(f"Musafir query generation failed, using intelligent local engine: {e}")

    # 2. Rich Local Travel Intelligence Engine (instant offline answers for all regions and questions)
    q = query.lower()

    # Greetings
    if q.strip() in ["hi", "hello", "hey", "salam", "assalam o alaikum", "assalam-o-alaikum", "aoa", "greetings"]:
        return "Wa Alaikum Assalam! I am Musafir.ai, your dedicated guide for Northern Pakistan. Which valley or route are you exploring — Hunza, Skardu, Swat, Fairy Meadows, or Naran? Ask me about top spots, road conditions, hotel rates, or PKR budgeting!"

    # Hunza Valley
    if "hunza" in q or "karimabad" in q or "attabad" in q or "passu" in q or "altit" in q or "baltit" in q:
        if "food" in q or "eat" in q:
            return "In Hunza, don't miss Chapshuro (crispy meat-filled mountain pie), Gyaling with apricot kernel oil, Dauro (local soup), and the famous walnut cake at Cafe de Hunza in Karimabad!"
        if "hotel" in q or "stay" in q:
            return "Top accommodations in Hunza include Serena Inn Hunza (Karimabad), Luxus Hunza (Attabad Lake view), Hard Rock Hunza, and cozy budget family guesthouses in Passu and Aliabad."
        return "Hunza Valley is world-famous for its majestic mountain vistas and rich heritage: the 800-year-old Baltit Fort, Altit Fort & royal gardens, the brilliant turquoise Attabad Lake (boating & jet skiing), the dramatic Passu Cones, the Hussaini Suspension Bridge, and watching the sunset over Rakaposhi and Ladyfinger Peak from Eagle's Nest (Duikar)!"

    # Skardu & Baltistan
    if "skardu" in q or "baltistan" in q or "shangrila" in q or "deosai" in q or "katpana" in q or "shigar" in q:
        if "food" in q or "eat" in q:
            return "In Skardu, savor Balti Mamtus (steamed spiced dumplings), Prapoo (handmade pasta with walnut paste), traditional Balti butter tea (Payu Chai), and fresh cold-water trout fish!"
        return "Skardu is the crown jewel of Karakoram! Most famous landmarks include the world-famous Shangrila Resort & Lower Kachura Lake, the surreal Katpana Cold Desert (where dunes meet snow), the 400-year-old Serena Shigar Fort, Khaplu Palace, and the sprawling Deosai National Park ('Land of the Giants') with Sheosar Lake. It is also the gateway to K2!"

    # Swat Valley
    if "swat" in q or "kalam" in q or "malam jabba" in q or "mahodand" in q:
        return "Swat Valley (known as the 'Switzerland of the East') is renowned for the Malam Jabba Ski Resort & Chairlift, the stunning alpine Mahodand Lake reachable by 4x4 Jeep from Kalam, the lush pine canopies of Ushu Forest, and riverside trout dining along the Swat River!"

    # Naran Kaghan
    if "naran" in q or "kaghan" in q or "saiful malook" in q or "saif-ul-malook" in q or "babusar" in q:
        return "Naran Kaghan is famous for Lake Saiful Malook (the mythical alpine lake beneath Malika Parbat peak), the breathtaking Babusar Top pass (4,173m), scenic Lulusar Lake, and the green alpine plateau of Shogran & Siri Paye."

    # Fairy Meadows & Nanga Parbat
    if "fairy meadows" in q or "nanga parbat" in q or "raikot" in q or "beyal" in q:
        return "Fairy Meadows is celebrated as one of the most scenic campsites on Earth, sitting directly beneath the towering 8,126m north face of Nanga Parbat ('Killer Mountain'). Highlights include the reflection pool, the hike to Beyal Camp, and the adventurous 4x4 Jeep ascent from Raikot Bridge followed by the pine trail hike."

    # Neelum Valley & Kashmir
    if "neelum" in q or "kashmir" in q or "arang kel" in q or "ratti gali" in q or "sharda" in q:
        return "Neelum Valley is famed for the postcard-perfect wooden village of Arang Kel (reached via chairlift and short trek), the alpine gem Ratti Gali Lake (3,700m), historic ruins of the 9th-century Sharda Peeth University, and river walks through deodar forests."

    # Roads, Passes & Transport
    if "road" in q or "route" in q or "pass" in q or "highway" in q or "kkh" in q or "transport" in q or "jeep" in q or "car" in q:
        return "The N-15 Highway via Babusar Pass (4,173m) is typically open from late June to October and connects Islamabad to Gilgit in ~12-14 hours. In winter or during pass closures, traffic uses the Karakoram Highway (KKH) via Bisham and Kohistan. For off-road spots like Deosai, Fairy Meadows, or Saiful Malook, hiring a local 4x4 Jeep with driver (PKR 5,000 - 8,000/day) is essential!"

    # Budget & Pricing
    if "budget" in q or "cost" in q or "pkr" in q or "price" in q or "how much" in q or "rate" in q:
        return "Realistic travel budgets for Northern Pakistan in PKR:\n• Budget Explorer: PKR 8,000 - 12,000 / day per person (local transport, standard rooms, local dining).\n• Family Comfort: PKR 16,000 - 24,000 / day per family member (private Prado/Hiace, comfortable motels, full meals).\n• Luxury Retreat: PKR 35,000+ / day (Serena, Luxus, private 4WD).\n*Tip: Always carry physical cash, as ATMs are scarce outside Gilgit, Skardu, and Abbottabad.*"

    # Food & Cuisine
    if "food" in q or "eat" in q or "dish" in q or "specialty" in q or "cuisine" in q:
        return "Northern Pakistani cuisine highlights:\n1. Hunza: Chapshuro (meat pie), Gyaling with apricot oil, walnut cake, Tumuro herbal tea.\n2. Swat & Kaghan: Freshly pan-fried trout fish, Chapli kababs, and Shinwari mutton karahi.\n3. Skardu: Balti Mamtus (dumplings) and Payu chai (salted butter tea).\n4. Kashmir: Gushtaba, Roghan Josh, Kashmiri Kulcha, and hot Nun Chai!"

    # Weather, Best Time & Seasons
    if "weather" in q or "season" in q or "best time" in q or "month" in q or "when" in q or "snow" in q or "winter" in q:
        return "Best travel seasons for Northern Pakistan:\n• Cherry Blossom (April - May): Hunza & Skardu bloom with pink/white apricot orchards.\n• Summer (June - August): Peak season, all passes open, daytime 18°C - 26°C.\n• Golden Autumn (October): Spectacular golden poplar foliage in Hunza and Skardu.\n• Winter (December - February): Heavy snowfall, skiing at Malam Jabba, and frozen lakes."

    # Packing & Safety
    if "pack" in q or "safety" in q or "safe" in q or "permit" in q or "cnic" in q or "cloth" in q:
        return "Essential Northern Pakistan travel tips:\n1. Documents: Carry physical CNIC (or Passport + Visa for foreigners).\n2. Clothing: Pack warm fleece layers, windproof jackets, and sturdy trekking shoes even in summer, as mountain evenings drop near 8°C.\n3. Connectivity: SCOM mobile SIM has the best coverage in Gilgit-Baltistan and Kashmir.\n4. Health: Carry basic altitude sickness meds, rehydration salts, and motion sickness tablets for winding mountain roads."

    # Default Contextual Response
    return f"Welcome to Musafir.ai! For exploring {context or 'Northern Pakistan'}, the top destinations are Hunza Valley, Skardu, Swat, Naran Kaghan, Fairy Meadows, and Neelum Valley. You can ask me about must-see spots, road pass openings, local food, hotel suggestions, or PKR budget estimations for any of these valleys!"
