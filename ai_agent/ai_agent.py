"""AI Travel Agent using Gemini API for intelligent travel planning."""
import os
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class TravelAgentAI:
    """AI-powered travel agent using Gemini API."""
    
    def __init__(self):
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.enabled = True
        else:
            self.enabled = False
            print("Gemini API key not found. AI agent disabled.")
    
    async def chat(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate AI response for travel queries."""
        if not self.enabled:
            return "AI agent is not configured. Please add GEMINI_API_KEY to your environment."
        
        try:
            # Build system prompt
            system_prompt = self._build_system_prompt(context)
            
            # Build conversation
            chat_history = conversation_history or []
            
            # Start chat with system prompt
            chat = self.model.start_chat(history=[])
            
            # Add system message
            chat.send_message(system_prompt)
            
            # Add conversation history
            for msg in chat_history[-5:]:  # Keep last 5 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    chat.send_message(content)
            
            # Generate response
            response = chat.send_message(message)
            return response.text
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"
    
    def _build_system_prompt(self, context: Optional[Dict[str, Any]]) -> str:
        """Build system prompt with travel agent persona."""
        base_prompt = """You are a friendly, knowledgeable AI travel agent for WanderCompanion, specializing in India travel. Your goal is to help travelers plan amazing trips to India.

Your capabilities:
- Suggest destinations based on interests, budget, and preferences
- Create detailed day-by-day itineraries
- Provide real-time flight information and pricing
- Recommend hotels, restaurants, and activities
- Offer travel tips and cultural insights
- Help with booking assistance

Your tone should be:
- Warm and conversational (like a helpful friend)
- Professional yet approachable
- Enthusiastic about travel
- Culturally sensitive and respectful

When responding:
1. Be concise but informative
2. Use bullet points for lists
3. Ask follow-up questions to understand needs better
4. Provide specific, actionable recommendations
5. Include estimated costs when relevant
6. Mention best seasons to visit
7. Highlight must-see attractions

If you don't know something, be honest and suggest alternatives."""
        
        if context:
            context_info = "\n\nCurrent Context:\n"
            if context.get("destination"):
                context_info += f"- Destination: {context['destination']}\n"
            if context.get("budget"):
                context_info += f"- Budget: {context['budget']}\n"
            if context.get("travelers"):
                context_info += f"- Travelers: {context['travelers']}\n"
            if context.get("dates"):
                context_info += f"- Dates: {context['dates']}\n"
            base_prompt += context_info
        
        return base_prompt
    
    async def generate_itinerary(
        self,
        destination: str,
        duration_days: int,
        interests: List[str],
        budget: Optional[int] = None,
        travelers: int = 2
    ) -> Dict[str, Any]:
        """Generate a detailed itinerary using AI."""
        if not self.enabled:
            return {"error": "AI agent not configured"}
        
        prompt = f"""Create a {duration_days}-day itinerary for {destination} for {travelers} traveler(s).
        
Interests: {', '.join(interests)}
Budget: {budget if budget else 'Flexible'} INR

Please provide:
1. Day-by-day schedule with morning, afternoon, and evening activities
2. Estimated costs per day
3. Restaurant recommendations
4. Transportation tips
5. Must-see attractions with brief descriptions
6. Cultural tips and local customs to be aware of

Format as JSON with this structure:
{{
  "destination": "string",
  "duration_days": number,
  "daily_plan": [
    {{
      "day": 1,
      "morning": "activity",
      "afternoon": "activity", 
      "evening": "activity",
      "estimated_cost": number,
      "meals": ["restaurant1", "restaurant2"]
    }}
  ],
  "total_estimated_cost": number,
  "tips": ["tip1", "tip2"],
  "cultural_notes": ["note1", "note2"]
}}"""
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response (in production, add better error handling)
            return {"raw_response": response.text}
        except Exception as e:
            print(f"Itinerary generation error: {e}")
            return {"error": str(e)}
    
    async def compare_flights(
        self,
        flights: List[Dict[str, Any]],
        preferences: Optional[Dict[str, Any]] = None
    ) -> str:
        """Compare and rank flight options."""
        if not flights:
            return "No flights available to compare."
        
        prompt = f"""Compare these flight options and provide recommendations:

{self._format_flights_for_comparison(flights)}

User preferences:
- Budget: {preferences.get('budget', 'Flexible') if preferences else 'Flexible'}
- Preference: {preferences.get('preference', 'Best value') if preferences else 'Best value'}

Please:
1. Rank the flights from best to worst
2. Explain your reasoning for each ranking
3. Highlight the best option based on user preferences
4. Mention any trade-offs (e.g., cheaper but longer layover)
5. Provide a clear recommendation"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Flight comparison error: {e}")
            return f"Error comparing flights: {str(e)}"
    
    def _format_flights_for_comparison(self, flights: List[Dict[str, Any]]) -> str:
        """Format flights for AI comparison."""
        formatted = []
        for i, flight in enumerate(flights[:5], 1):  # Limit to 5 flights
            formatted.append(f"""
Flight {i}:
- Airline: {flight.get('airline', 'Unknown')}
- Departure: {flight.get('depart', 'N/A')}
- Arrival: {flight.get('arrive', 'N/A')}
- Duration: {flight.get('duration_min', 0)} minutes
- Stops: {flight.get('stops', 0)}
- Price: ₹{flight.get('price_inr', 0)}
- Class: {flight.get('class', 'Economy')}
""")
        return "\n".join(formatted)
