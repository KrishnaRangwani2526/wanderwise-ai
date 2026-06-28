"""Duffel API integration for flight booking."""
import os
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

DUFFEL_API_KEY = os.getenv("DUFFEL_API_KEY")
DUFFEL_BASE = "https://api.duffel.com/2019-09-01"

class DuffelBookingAPI:
    """Duffel API for flight search and booking."""
    
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=DUFFEL_BASE,
            headers={
                "Authorization": f"Bearer {DUFFEL_API_KEY}",
                "Content-Type": "application/json",
                "Duffel-Version": "v1"
            },
            timeout=30.0
        )
    
    async def search_offers(
        self,
        origin: str,
        destination: str,
        date: str,
        travelers: int = 1,
        cabin_class: str = "economy"
    ) -> List[Dict[str, Any]]:
        """Search for flight offers using Duffel API."""
        if not DUFFEL_API_KEY:
            return []
        
        try:
            # Create slice (one-way flight)
            slices = [{
                "origin": origin,
                "destination": destination,
                "departure_date": date,
                "cabin_class": cabin_class
            }]
            
            # Create passengers
            passengers = [{"type": "adult"} for _ in range(travelers)]
            
            # Search for offers
            response = await self.client.post(
                "/air/offer_requests",
                json={
                    "slices": slices,
                    "passengers": passengers,
                    "max_connections": 2
                }
            )
            response.raise_for_status()
            data = response.json()
            
            offer_request_id = data.get("id")
            if not offer_request_id:
                return []
            
            # Get offers
            offers_response = await self.client.get(
                f"/air/offer_requests/{offer_request_id}/offers"
            )
            offers_response.raise_for_status()
            offers_data = offers_response.json()
            
            return self._format_offers(offers_data.get("data", []))
            
        except Exception as e:
            print(f"Duffel API error: {e}")
            return []
    
    def _format_offers(self, offers: List[Dict]) -> List[Dict[str, Any]]:
        """Format Duffel offers into standard format."""
        formatted = []
        
        for offer in offers[:10]:  # Limit to 10 results
            try:
                slices = offer.get("slices", [])
                if not slices:
                    continue
                
                first_slice = slices[0]
                segments = first_slice.get("segments", [])
                if not segments:
                    continue
                
                first_segment = segments[0]
                last_segment = segments[-1]
                
                # Calculate total duration
                total_duration = sum(
                    seg.get("duration", {}).get("seconds", 0) 
                    for seg in segments
                ) // 60  # Convert to minutes
                
                cabin_class = first_slice.get("cabin_class", "economy")
                formatted.append({
                    "id": f"duffel_{offer.get('id', 'unknown')}",
                    "airline": first_segment.get("operating_carrier", {}).get("name", "Unknown"),
                    "flight_number": first_segment.get("operating_carrier_flight_number", ""),
                    "from": first_segment.get("origin", {}).get("iata_code", ""),
                    "to": last_segment.get("destination", {}).get("iata_code", ""),
                    "depart": first_segment.get("departing_at", ""),
                    "arrive": last_segment.get("arriving_at", ""),
                    "duration_min": total_duration,
                    "stops": len(segments) - 1,
                    "price_inr": int(offer.get("total_amount", "0").replace(".", "")),
                    "class": cabin_class_from_duffel(cabin_class),
                    "baggage": "15 kg",
                    "refundable": offer.get("refundable", False),
                    "external_url": f"https://www.duffel.com/offer/{offer.get('id')}",
                    "source": "duffel",
                    "offer_id": offer.get("id")
                })
            except Exception as e:
                print(f"Error formatting offer: {e}")
                continue
        
        return formatted
    
    async def create_booking(self, offer_id: str, passengers: List[Dict]) -> Optional[Dict[str, Any]]:
        """Create a booking using Duffel API."""
        if not DUFFEL_API_KEY:
            return None
        
        try:
            response = await self.client.post(
                "/air/orders",
                json={
                    "offers": [{"id": offer_id}],
                    "passengers": passengers
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Duffel booking error: {e}")
            return None
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()

def cabin_class_from_duffel(cabin: str) -> str:
    """Convert Duffel cabin class to standard format."""
    mapping = {
        "economy": "Economy",
        "premium_economy": "Premium Eco",
        "business": "Business",
        "first": "First"
    }
    return mapping.get(cabin.lower(), "Economy")
