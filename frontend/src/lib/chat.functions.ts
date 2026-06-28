/**
 * AI chat via Lovable AI Gateway (Gemini). No DB — history lives in browser localStorage.
 * Used by the floating chat drawer + shareable to Dream / Plan / Optimize.
 */
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are WanderCompanion's onboard travel concierge for India.

You help travelers DREAM, ANALYZE, PLAN, OPTIMIZE, SIGHTSEE, BOOK and TRAVEL.
The user can later push the conversation into our Dream / Plan / Optimize tools.

Style:
- Friendly but tight. Short sentences. Markdown lists when useful.
- Prices in ₹ INR. Use tables for comparisons.
- Always end with one clarifying question OR a clear next step.
- When the user mentions a destination, mood, season or budget, surface
  matching ideas and tell them which tool to open (e.g. "Open Dream to see ranked picks").
- Never invent flight numbers / hotel names. For real booking always tell
  the user to open the Book tool which deep-links to Skyscanner / IRCTC / Booking.com.
`;

export const chat = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMsg[] }) => {
    if (!data || !Array.isArray(data.messages)) throw new Error("messages[] required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: data.messages }),
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const json = await res.json();
      return { text: json.text, error: false };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      return { text: `AI backend error: ${msg}. Make sure your local engine is running.`, error: true };
    }
  });
