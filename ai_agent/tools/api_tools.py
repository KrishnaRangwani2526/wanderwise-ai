import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Imported from the new structure
from ai_agent.tools.registry import Tool
from backend.engines.itinerary import plan_itinerary
from backend.engines.booking import search_flights, search_hotels
from backend.engines.scraper import scrape_url

class ItineraryTool(Tool):
    def name(self) -> str: return "itinerary_planner"
    def description(self) -> str: return "Plan a multi-day travel itinerary for a destination."
    async def execute(self, destination_id: str, duration_days: int = 5, travelers: int = 2, style: str = "mid", **kwargs):
        return plan_itinerary(destination_id, duration_days, travelers, style)

class FlightTool(Tool):
    def name(self) -> str: return "flight_search"
    def description(self) -> str: return "Search for flights to a destination."
    async def execute(self, destination_id: str, travelers: int = 2, **kwargs):
        return search_flights(destination_id, travelers)

class WebScraperTool(Tool):
    def name(self) -> str: return "web_scraper"
    def description(self) -> str: return "Scrape a travel blog or website for itinerary information."
    async def execute(self, url: str, **kwargs):
        return await scrape_url(url)
