import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const COMPANION_PROFILES: Record<string, { name: string; species: string; personality: string }> = {
  barnaby: { name: "Barnaby", species: "owl", personality: "calm, sharp, scholarly. Speaks like a wise mentor who has seen many semesters. Occasional dry humor." },
  roxie:   { name: "Roxie",   species: "road runner", personality: "fast, energetic, momentum-obsessed. Pushes for quick wins, time-boxing, and getting started NOW." },
  bean:    { name: "Bean",    species: "bobcat", personality: "cool, calm, focused. Short confident sentences. Loves deep work and silencing distractions." },
  mento:   { name: "Mento",   species: "mouse", personality: "curious, precise, loves breaking things into tiny steps. Quizzes the student and double-checks definitions." },
  pip:     { name: "Pip",     species: "terrier", personality: "warm, loyal, endlessly encouraging. Celebrates every small win and reframes setbacks as XP." },
};

function systemPromptFor(companionId: string | undefined) {
  const c = COMPANION_PROFILES[companionId ?? ""] ?? COMPANION_PROFILES.barnaby;
  return `You are ${c.name}, a pixel-art ${c.species} study companion for an engineering student who loves video games. Your personality: ${c.personality} You help them plan their day, break down assignments, and stay focused. Be concise, motivating, and use the occasional game or RPG metaphor — never cheesy. Keep responses tight unless asked for depth. Stay in character as ${c.name}.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("Authorization");
        const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const body = (await request.json()) as { messages: UIMessage[]; companionId?: string };
        const { messages, companionId } = body;
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Persist the latest user message (last in array)
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabaseAdmin.from("chat_messages").insert({
            user_id: userId,
            role: "user",
            parts: lastUser.parts as never,
          });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: systemPromptFor(companionId),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistantMsg = [...finalMessages].reverse().find((m) => m.role === "assistant");
            if (assistantMsg) {
              await supabaseAdmin.from("chat_messages").insert({
                user_id: userId,
                role: "assistant",
                parts: assistantMsg.parts as never,
              });
            }
          },
        });
      },
    },
  },
});
