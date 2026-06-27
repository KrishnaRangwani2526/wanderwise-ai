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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { text: "AI is not configured (missing LOVABLE_API_KEY).", error: true };
    }
    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });
    try {
      const result = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      });
      return { text: result.text, error: false };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      // Surface 429 / 402 plainly
      if (/429|rate/i.test(msg)) return { text: "Rate limited — try again in a few seconds.", error: true };
      if (/402|credit|payment/i.test(msg)) return { text: "AI credits exhausted — add credits in workspace settings.", error: true };
      return { text: `AI error: ${msg}`, error: true };
    }
  });
