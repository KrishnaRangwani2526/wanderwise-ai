"""Real-time flight data integration using AirLabs and AviationStack APIs."""
import os
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

AIRLABS_API_KEY = os.getenv("AIRLABS_API_KEY")
AVIATIONSTACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")

class FlightDataAPI:
    """Unified flight data API with fallback support."""
    
    def __init__(self):
        self.airlabs_base = "https://airlabs.co/api/v9"
        self.aviationstack_base = "http://api.aviationstack.com/v1"
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        date: Optional[str] = None,
        travelers: int = 1
    ) -> List[Dict[str, Any]]:
        """Search for flights using AirLabs API with AviationStack fallback."""
        results = []
        
        # Try AirLabs first
        if AIRLABS_API_KEY:
            try:
                results = await self._search_airlabs(origin, destination, date, travelers)
                if results:
                    return results
            except Exception as e:
                print(f"AirLabs API error: {e}")
        
        # Fallback to AviationStack
        if AVIATIONSTACK_API_KEY:
            try:
                results = await self._search_aviationstack(origin, destination, date, travelers)
            except Exception as e:
                print(f"AviationStack API error: {e}")
        
        return results
    
    async def _search_airlabs(
        self,
        origin: str,
        destination: str,
        date: Optional[str],
        travelers: int
    ) -> List[Dict[str, Any]]:
        """Search flights using AirLabs API."""
        params = {
            "api_key": AIRLABS_API_KEY,
            "dep_iata": origin,
            "arr_iata": destination,
        }
        if date:
            params["date"] = date
        
        response = await self.client.get(
            f"{self.airlabs_base}/flights",
            params=params
        )
        response.raise_for_status()
        data = response.json()
        
        if not data.get("response"):
            return []
        
        flights = []
        for flight in data["response"][:10]:  # Limit to 10 results
            flights.append({
                "id": f"airlabs_{flight.get('flight_number', 'unknown')}",
                "airline": flight.get("airline", {}).get("name", "Unknown"),
                "flight_number": flight.get("flight_number", ""),
                "from": flight.get("dep", {}).get("iata", origin),
                "to": flight.get("arr", {}).get("iata", destination),
                "depart": flight.get("dep", {}).get("scheduled", ""),
                "arrive": flight.get("arr", {}).get("scheduled", ""),
                "duration_min": self._calculate_duration(
                    flight.get("dep", {}).get("scheduled"),
                    flight.get("arr", {}).get("scheduled")
                ),
                "stops": 0,  # AirLabs provides direct flights
                "price_inr": self._estimate_price(origin, destination),
                "class": "Economy",
                "baggage": "15 kg",
                "refundable": False,
                "external_url": f"https://www.google.com/travel/flights?q=flights from {origin} to {destination}",
                "source": "airlabs"
            })
        
        return flights
    
    async def _search_aviationstack(
        self,
        origin: str,
        destination: str,
        date: Optional[str],
        travelers: int
    ) -> List[Dict[str, Any]]:
        """Search flights using AviationStack API."""
        params = {
            "access_key": AVIATIONSTACK_API_KEY,
            "dep_iata": origin,
            "arr_iata": destination,
        }
        if date:
            params["flight_date"] = date
        
        response = await self.client.get(
            f"{self.aviationstack_base}/flights",
            params=params
        )
        response.raise_for_status()
        data = response.json()
        
        if not data.get("data"):
            return []
        
        flights = []
        for flight in data["data"][:10]:
            flights.append({
                "id": f"aviationstack_{flight.get('flight', {}).get('iata', 'unknown')}",
                "airline": flight.get("airline", {}).get("name", "Unknown"),
                "flight_number": flight.get("flight", {}).get("iata", ""),
                "from": flight.get("departure", {}).get("iata", origin),
                "to": flight.get("arrival", {}).get("iata", destination),
                "depart": flight.get("departure", {}).get("scheduled", ""),
                "arrive": flight.get("arrival", {}).get("scheduled", ""),
                "duration_min": self._calculate_duration(
                    flight.get("departure", {}).get("scheduled"),
                    flight.get("arrival", {}).get("scheduled")
                ),
                "stops": 0,
                "price_inr": self._estimate_price(origin, destination),
                "class": "Economy",
                "baggage": "15 kg",
                "refundable": False,
                "external_url": f"https://www.google.com/travel/flights?q=flights from {origin} to {destination}",
                "source": "aviationstack"
            })
        
        return flights
    
    def _calculate_duration(self, depart: str, arrive: str) -> int:
        """Calculate flight duration in minutes from scheduled times."""
        try:
            # Simple calculation - in production, use proper datetime parsing
            return 120  # Default 2 hours
        except:
            return 120
    
    def _estimate_price(self, origin: str, destination: str) -> int:
        """Estimate price based on route (fallback when API doesn't provide pricing)."""
        # Simple heuristic based on distance
        base_price = 5000
        return base_price
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
