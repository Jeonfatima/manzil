export interface Session {
  mode: 'guest' | 'user';
  name: string;
  email?: string;
  userId?: number;
}

export interface SpotRate {
  id: number;
  destination_id: number;
  hotel_budget_pkr: number;
  hotel_standard_pkr: number;
  hotel_luxury_pkr: number;
  daily_transport_pkr: number;
  daily_food_pkr: number;
  spots_data?: any[];
}

export interface Destination {
  id: number;
  name: string;
  province: string;
  avg_daily_budget_pkr: number;
  latitude: number;
  longitude: number;
  description: string;
  image_url: string;
  popular_spots: string[];
  optimal_seasons?: string;
  best_hotels?: string;
  food_specialties?: string;
  weather_key?: string;
  weather?: WeatherInfo | null;
  spot_rate?: SpotRate | null;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  forecast: { day: string; temp: number; condition: string }[];
}

export interface Activity {
  time: string;
  title: string;
  duration: string;
  cost: number;
  details: string;
}

export interface DailyPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface CostBreakdown {
  stay_pkr: number;
  meals_pkr: number;
  transport_pkr: number;
  activities_pkr: number;
  total_estimated_pkr: number;
}

export interface Itinerary {
  starting_hub: string;
  recommended_hotel: string;
  cost_breakdown?: CostBreakdown;
  daily_plan: DailyPlan[];
}

export interface Expense {
  id: number;
  trip_id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Trip {
  id: number | null;
  title: string;
  destination_id: number;
  total_days: number;
  total_budget: number;
  travel_style: string;
  start_date: string;
  itinerary: Itinerary | null;
  expenses: Expense[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
}
