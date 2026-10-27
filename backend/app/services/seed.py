from sqlmodel import Session, select
from app.database import engine, init_db
from app.models import Destination, SpotRate

DESTINATIONS_DATA = [
    {
        "name": "Hunza Valley",
        "province": "Gilgit-Baltistan",
        "avg_daily_budget_pkr": 12000,
        "latitude": 36.33,
        "longitude": 73.69,
        "description": "The jewel of Gilgit-Baltistan, where the Indus River carves a canyon past terraced orchards, forts, and alpine lakes.",
        "image_url": "https://images.unsplash.com/photo-1586016413664-864c0dd76f53?q=80&w=1200",
        "optimal_seasons": "April - October (Cherry Blossom & Autumn)",
        "best_hotels": "Serena Inn Hunza, Luxus Hunza, Hard Rock Hunza",
        "food_specialties": "Chapshuro, Gyaling with Apricot Oil, Walnut Cake, Trout",
        "popular_spots": ["Baltit Fort", "Altit Fort", "Attabad Lake", "Passu Cones", "Eagle's Nest"],
        "rate": {
            "hotel_budget_pkr": 4500,
            "hotel_standard_pkr": 11000,
            "hotel_luxury_pkr": 30000,
            "daily_transport_pkr": 6000,
            "daily_food_pkr": 2500,
            "spots_data": [
                {"name": "Baltit Fort Guided Tour", "cost_pkr": 1200},
                {"name": "Attabad Lake Jet Ski / Boating", "cost_pkr": 2500},
                {"name": "Hussaini Suspension Bridge crossing", "cost_pkr": 500},
                {"name": "Passu Glacier Trek guide", "cost_pkr": 3000}
            ]
        }
    },
    {
        "name": "Skardu",
        "province": "Gilgit-Baltistan",
        "avg_daily_budget_pkr": 15000,
        "latitude": 35.32,
        "longitude": 74.85,
        "description": "Gateway to the Karakoram, home to the world-famous Shangrila lake system and the stark beauty of Deosai National Park.",
        "image_url": "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=1200",
        "optimal_seasons": "May - September",
        "best_hotels": "Shangrila Resort, Serena Shigar Fort, Khaplu Palace",
        "food_specialties": "Mamtu (Dumplings), Balti Butter Tea, Yak Meat Steak, Trout",
        "popular_spots": ["Shangrila Lake", "Deosai National Park", "Katpana Cold Desert", "Shigar Fort"],
        "rate": {
            "hotel_budget_pkr": 5000,
            "hotel_standard_pkr": 14000,
            "hotel_luxury_pkr": 35000,
            "daily_transport_pkr": 7500,
            "daily_food_pkr": 2800,
            "spots_data": [
                {"name": "Shangrila Resort Entry & Lake Boat", "cost_pkr": 1500},
                {"name": "Deosai 4x4 Jeep Safari", "cost_pkr": 9000},
                {"name": "Katpana Desert ATV Quad ride", "cost_pkr": 2500},
                {"name": "Shigar Fort Historical Museum", "cost_pkr": 1000}
            ]
        }
    },
    {
        "name": "Swat Valley",
        "province": "Khyber Pakhtunkhwa",
        "avg_daily_budget_pkr": 9000,
        "latitude": 34.93,
        "longitude": 72.66,
        "description": "The Switzerland of the East, with pine-covered hills, rushing rivers, and the legendary Malam Jabba ski resort.",
        "image_url": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1200",
        "optimal_seasons": "Year-round (Skiing Dec-Feb, Lush Green May-Oct)",
        "best_hotels": "Pearl Continental Malam Jabba, Swat Serena Hotel, Rock City Resort",
        "food_specialties": "Swat Trout Fish, Chapli Kabab, Charsi Tikka, Honey Dates",
        "popular_spots": ["Malam Jabba Ski Resort", "Mahodand Lake", "Kalam Valley", "Fizagat Park"],
        "rate": {
            "hotel_budget_pkr": 3500,
            "hotel_standard_pkr": 8500,
            "hotel_luxury_pkr": 22000,
            "daily_transport_pkr": 4500,
            "daily_food_pkr": 2000,
            "spots_data": [
                {"name": "Malam Jabba Chairlift / Zipline", "cost_pkr": 2000},
                {"name": "Mahodand Lake 4x4 Jeep excursion", "cost_pkr": 5500},
                {"name": "Ushu Forest nature trail", "cost_pkr": 500}
            ]
        }
    },
    {
        "name": "Naran Kaghan",
        "province": "Khyber Pakhtunkhwa",
        "avg_daily_budget_pkr": 9500,
        "latitude": 34.93,
        "longitude": 73.15,
        "description": "A high-altitude valley of alpine meadows, Saiful Malook lake, and quiet pine forests high in the Himalayas.",
        "image_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200",
        "optimal_seasons": "June - September (Babusar Pass Open)",
        "best_hotels": "Hotel Demanchi, Arcadian Riverside Shogran, Pine Park",
        "food_specialties": "Fresh Kunhar River Trout, Hot Pakoras, Shinwari Karahi",
        "popular_spots": ["Lake Saiful Malook", "Babusar Top", "Lulusar Lake", "Shogran & Siri Paye"],
        "rate": {
            "hotel_budget_pkr": 3800,
            "hotel_standard_pkr": 9000,
            "hotel_luxury_pkr": 24000,
            "daily_transport_pkr": 5000,
            "daily_food_pkr": 2100,
            "spots_data": [
                {"name": "Saiful Malook 4x4 Jeep return ticket", "cost_pkr": 4000},
                {"name": "Siri Paye 4WD track transport", "cost_pkr": 4500},
                {"name": "Rafting on Kunhar River", "cost_pkr": 2500}
            ]
        }
    },
    {
        "name": "Fairy Meadows",
        "province": "Gilgit-Baltistan",
        "avg_daily_budget_pkr": 11000,
        "latitude": 35.76,
        "longitude": 74.52,
        "description": "Alpine grassland meadows beneath the giant north face of Nanga Parbat, famous for starlit camping and mountain serenity.",
        "image_url": "https://images.unsplash.com/photo-1472126836914-2b4e0d7b8ba7?q=80&w=1200",
        "optimal_seasons": "June - September",
        "best_hotels": "Raikot Sarai, Fairy Meadows Cottages, Shambala Camp",
        "food_specialties": "Woodfire Daal Roti, Local Mutton stew, Herbal Mountain Tea",
        "popular_spots": ["Nanga Parbat Base Camp", "Beyal Camp", "Reflection Pool", "Raikot Bridge"],
        "rate": {
            "hotel_budget_pkr": 4000,
            "hotel_standard_pkr": 9500,
            "hotel_luxury_pkr": 20000,
            "daily_transport_pkr": 7000,
            "daily_food_pkr": 2400,
            "spots_data": [
                {"name": "Raikot to Tato 4x4 Jeep transfer", "cost_pkr": 7500},
                {"name": "Horse / Porter hire to Fairy Meadows", "cost_pkr": 3500},
                {"name": "Guided Nanga Parbat Basecamp trek", "cost_pkr": 4000}
            ]
        }
    },
    {
        "name": "Neelum Valley",
        "province": "Azad Jammu & Kashmir",
        "avg_daily_budget_pkr": 8500,
        "latitude": 34.02,
        "longitude": 73.65,
        "description": "The Paradise Valley of Kashmir, a lush green river valley with dense deodar forests, wooden hamlets, and pristine alpine lakes.",
        "image_url": "https://images.unsplash.com/photo-1609825488888-3a766db05542?q=80&w=1200",
        "optimal_seasons": "May - October",
        "best_hotels": "Kutton Jagran Resort, Pine Resort Keran, Green Village Resort Arang Kel",
        "food_specialties": "Kashmiri Gushtaba, Roghan Josh, Kulcha with Nun Chai, Goshtaba",
        "popular_spots": ["Arang Kel", "Ratti Gali Lake", "Sharda Peeth University Ruins", "Taobut"],
        "rate": {
            "hotel_budget_pkr": 3200,
            "hotel_standard_pkr": 7500,
            "hotel_luxury_pkr": 19000,
            "daily_transport_pkr": 4800,
            "daily_food_pkr": 1900,
            "spots_data": [
                {"name": "Ratti Gali Lake 4x4 Jeep trip", "cost_pkr": 6000},
                {"name": "Kel to Arang Kel Chairlift", "cost_pkr": 400},
                {"name": "Sharda Peeth archaeological ticket", "cost_pkr": 300}
            ]
        }
    },
    {
        "name": "Deosai",
        "province": "Gilgit-Baltistan",
        "avg_daily_budget_pkr": 13000,
        "latitude": 34.81,
        "longitude": 76.32,
        "description": "The 'Land of the Giants', a vast high-altitude plateau famous for wildflowers, crystal Sheosar Lake, and Himalayan brown bears.",
        "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
        "optimal_seasons": "July - September (Snow-free window)",
        "best_hotels": "Deosai Glampsite Camps, PTDC Astore, Bara Pani Tentage Village",
        "food_specialties": "Campfire Balti Barbecue, Hearty Noodle Soup, Kehwa with Saffron",
        "popular_spots": ["Sheosar Lake", "Bara Pani Bridge", "Kala Pani", "Ali Malik Top"],
        "rate": {
            "hotel_budget_pkr": 4500,
            "hotel_standard_pkr": 11000,
            "hotel_luxury_pkr": 25000,
            "daily_transport_pkr": 8000,
            "daily_food_pkr": 2600,
            "spots_data": [
                {"name": "Deosai National Park entry fee", "cost_pkr": 1000},
                {"name": "Sheosar Lake full day 4WD tour", "cost_pkr": 9500},
                {"name": "Wildlife spotting guided walk", "cost_pkr": 2500}
            ]
        }
    },
    {
        "name": "Chitral / Kalash",
        "province": "Khyber Pakhtunkhwa",
        "avg_daily_budget_pkr": 8000,
        "latitude": 35.86,
        "longitude": 71.79,
        "description": "The ancient homeland of the Kalasha people, featuring unique cedar-wood architecture, scenic Hindu Kush peaks, and cultural festivals.",
        "image_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200",
        "optimal_seasons": "May - October (Chilam Joshi & Uchal Festivals)",
        "best_hotels": "Hindukush Heights, PTDC Motel Chitral, Bumburet Heritage House",
        "food_specialties": "Ghalmandi, Sanabachi, Chitrali Mutton Tikka, Walnut Bread",
        "popular_spots": ["Bumburet Valley", "Rumbur Valley", "Chitral Fort & Shahi Mosque", "Lowari Pass"],
        "rate": {
            "hotel_budget_pkr": 3000,
            "hotel_standard_pkr": 7000,
            "hotel_luxury_pkr": 18000,
            "daily_transport_pkr": 4500,
            "daily_food_pkr": 1800,
            "spots_data": [
                {"name": "Kalash Cultural Museum entry", "cost_pkr": 500},
                {"name": "Bumburet valley 4WD local ride", "cost_pkr": 3500},
                {"name": "Chitral Gol National Park permit", "cost_pkr": 800}
            ]
        }
    },
]


def seed(session: Session) -> None:
    for d in DESTINATIONS_DATA:
        dest = session.exec(select(Destination).where(Destination.name == d["name"])).first()
        if not dest:
            dest = Destination(
                name=d["name"],
                province=d["province"],
                avg_daily_budget_pkr=d["avg_daily_budget_pkr"],
                latitude=d["latitude"],
                longitude=d["longitude"],
                description=d["description"],
                image_url=d["image_url"],
                optimal_seasons=d.get("optimal_seasons", "May - October"),
                best_hotels=d.get("best_hotels", "Serena, Luxus, PTDC"),
                food_specialties=d.get("food_specialties", "Local Trout, Karahi, Chapshuro"),
                popular_spots=d["popular_spots"],
            )
            session.add(dest)
            session.commit()
            session.refresh(dest)
        else:
            # Update fields if missing
            dest.province = d["province"]
            dest.avg_daily_budget_pkr = d["avg_daily_budget_pkr"]
            dest.latitude = d["latitude"]
            dest.longitude = d["longitude"]
            dest.description = d["description"]
            dest.image_url = d["image_url"]
            dest.optimal_seasons = d.get("optimal_seasons", dest.optimal_seasons)
            dest.best_hotels = d.get("best_hotels", dest.best_hotels)
            dest.food_specialties = d.get("food_specialties", dest.food_specialties)
            dest.popular_spots = d["popular_spots"]
            session.add(dest)
            session.commit()
            session.refresh(dest)

        # Seed SpotRate (Spots & Rates Table)
        rate_info = d.get("rate")
        if rate_info:
            existing_rate = session.exec(select(SpotRate).where(SpotRate.destination_id == dest.id)).first()
            if not existing_rate:
                sr = SpotRate(
                    destination_id=dest.id,
                    hotel_budget_pkr=rate_info["hotel_budget_pkr"],
                    hotel_standard_pkr=rate_info["hotel_standard_pkr"],
                    hotel_luxury_pkr=rate_info["hotel_luxury_pkr"],
                    daily_transport_pkr=rate_info["daily_transport_pkr"],
                    daily_food_pkr=rate_info["daily_food_pkr"],
                    spots_data=rate_info.get("spots_data", [])
                )
                session.add(sr)
            else:
                existing_rate.hotel_budget_pkr = rate_info["hotel_budget_pkr"]
                existing_rate.hotel_standard_pkr = rate_info["hotel_standard_pkr"]
                existing_rate.hotel_luxury_pkr = rate_info["hotel_luxury_pkr"]
                existing_rate.daily_transport_pkr = rate_info["daily_transport_pkr"]
                existing_rate.daily_food_pkr = rate_info["daily_food_pkr"]
                existing_rate.spots_data = rate_info.get("spots_data", [])
                session.add(existing_rate)

    session.commit()
    print("Successfully seeded destinations and Spots & Rates tables!")


def seed_database() -> None:
    init_db()
    with Session(engine) as session:
        seed(session)
