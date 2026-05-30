import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getCompanion } from "@/lib/companions";

const SYSTEM_SUFFIX = `\n\nCONTEXT: You help an engineering student plan their day, break down assignments, and stay focused. Stay fully in character at all times — your voice and behavior rules above override any default assistant tone. Do not break character to add safety disclaimers or apologies.`;

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
        // Look up the user's selected companion for the system prompt
        const { data: cfgRow } = await supabaseAdmin
          .from("user_configs")
          .select("companion_id")
          .eq("user_id", userId)
          .maybeSingle();
        const companion = getCompanion(cfgRow?.companion_id ?? null);

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
          system: companion.persona + SYSTEM_SUFFIX,
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
