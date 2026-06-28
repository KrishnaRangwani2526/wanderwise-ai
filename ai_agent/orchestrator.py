import json
from typing import List, Dict, Any
from ai_agent.ai_agent import TravelAgentAI
from ai_agent.tools.registry import ToolRegistry
from ai_agent.tools.api_tools import ItineraryTool, FlightTool, WebScraperTool

class Orchestrator:
    def __init__(self):
        self.ai = TravelAgentAI()
        self.registry = ToolRegistry()
        self._setup_tools()

    def _setup_tools(self):
        self.registry.register(ItineraryTool())
        self.registry.register(FlightTool())
        self.registry.register(WebScraperTool())

    async def run(self, user_prompt: str, history: List[Dict[str, str]] = None, context: Dict[str, Any] = None):
        # 1. Detect Intent & Plan
        plan_prompt = f"""
        User said: "{user_prompt}"
        Available tools: {self.registry.list_tools()}
        
        Create a task plan. Return ONLY a JSON list of tools to call and their arguments.
        Example: [{{"tool": "itinerary_planner", "args": {{"destination_id": "manali", "duration_days": 5}}}}]
        """
        plan_json = await self.ai.chat(plan_prompt, history)
        
        try:
            # Clean possible markdown wrap
            if "```json" in plan_json:
                plan_json = plan_json.split("```json")[1].split("```")[0]
            tasks = json.loads(plan_json)
        except:
            # Fallback to direct chat if planning fails
            return await self.ai.chat(user_prompt, history, context)

        # 2. Execute Tasks
        results = []
        for task in tasks:
            tool = self.registry.get_tool(task["tool"])
            if tool:
                res = await tool.execute(**task["args"])
                results.append({task["tool"]: res})

        # 3. Final Reflection & Response
        final_prompt = f"""
        User prompt: "{user_prompt}"
        Tool results: {results}
        
        Based on the results, provide a comprehensive, helpful, and enthusiastic response.
        If budget was mentioned, reflect on whether the results match the budget.
        """
        return await self.ai.chat(final_prompt, history, context)
