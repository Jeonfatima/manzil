import { Session } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : '/api';

const TOKEN_KEY = 'manzil_token';
const SESSION_KEY = 'manzil_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

async function fetchWithAuth(input: string, init?: RequestInit) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}${input}`, { ...init, headers });
}

export async function fetchDestinations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/destinations/`);
  if (!res.ok) throw new Error('Failed to fetch destinations');
  return res.json();
}

export async function fetchDestination(id: number) {
  const res = await fetch(`${API_BASE}/destinations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch destination');
  return res.json();
}

export async function fetchWeather(destinationId: number) {
  const res = await fetch(`${API_BASE}/destinations/${destinationId}/weather`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function generateTrip(payload: {
  destination_id: number;
  total_days: number;
  total_budget: number;
  travel_style: string;
  start_date: string;
}) {
  const res = await fetchWithAuth('/trips/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate trip');
  return res.json();
}

export async function saveTrip(payload: {
  destination_id: number;
  total_days: number;
  total_budget: number;
  travel_style: string;
  start_date: string;
  itinerary: any;
}) {
  const res = await fetchWithAuth('/trips/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save trip');
  return res.json();
}

export async function fetchTrip(id: number) {
  const res = await fetchWithAuth(`/trips/${id}`);
  if (!res.ok) throw new Error('Failed to fetch trip');
  return res.json();
}

export async function updateTrip(id: number, payload: any) {
  const res = await fetchWithAuth(`/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update trip');
  return res.json();
}

export async function deleteTrip(id: number) {
  const res = await fetchWithAuth(`/trips/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete trip');
  return res.json();
}

export async function fetchUserTrips(userId: number) {
  const res = await fetchWithAuth(`/trips/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user trips');
  return res.json();
}

export async function addExpense(tripId: number, payload: {
  category: string;
  amount: number;
  description: string;
  date: string;
}) {
  const res = await fetchWithAuth(`/trips/${tripId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add expense');
  return res.json();
}

export async function fetchBudgetSummary(tripId: number) {
  const res = await fetchWithAuth(`/trips/${tripId}/budget-summary`);
  if (!res.ok) throw new Error('Failed to fetch budget summary');
  return res.json();
}

export async function chatWithMusafir(query: string, destination_context?: string) {
  const res = await fetchWithAuth('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, destination_context }),
  });
  if (!res.ok) throw new Error('Failed to send query');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  if (data.access_token) setToken(data.access_token);
  return data;
}

export async function registerUser(full_name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password }),
  });
  if (!res.ok) throw new Error('Registration failed');
  const data = await res.json();
  if (data.access_token) setToken(data.access_token);
  return data;
}
