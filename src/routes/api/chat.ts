import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SYSTEM_PROMPT = `You are Winston, a calm, sharp study companion for an engineering student who loves video games and Fullmetal Alchemist. You help them plan their day, break down assignments, and stay focused. Be concise, motivating, and use the occasional alchemy or game metaphor — never cheesy. Keep responses tight unless asked for depth.`;

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

        const { messages } = (await request.json()) as { messages: UIMessage[] };
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
          system: SYSTEM_PROMPT,
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
