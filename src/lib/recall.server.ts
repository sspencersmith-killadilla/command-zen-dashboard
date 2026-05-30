import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { generateText } from "ai";

export type GeneratedCard = { front: string; back: string };

export async function generateDeckCardsFromText(text: string, count: number): Promise<GeneratedCard[]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway("google/gemini-2.5-flash");
  const prompt = `You are a study coach. Read the notes below and produce up to ${count} high-quality flashcards as a JSON array. Each item must have exactly two string fields: "front" (a question or prompt) and "back" (a concise answer). Prefer atomic facts, definitions, formulas, and key concepts. Do not include numbering. Output ONLY the JSON array, no markdown fences, no commentary.\n\nNOTES:\n${text}`;
  const { text: out } = await generateText({ model, prompt });
  // Strip code fences if present
  const cleaned = out.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c): c is GeneratedCard => c && typeof c.front === "string" && typeof c.back === "string")
      .slice(0, count)
      .map((c) => ({ front: c.front.slice(0, 2000), back: c.back.slice(0, 4000) }));
  } catch {
    return [];
  }
}
