import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getCompanion, PLAIN_PERSONA } from "@/lib/companions";
import { fetchCanvasAssignmentsFromConfig } from "@/lib/canvas.server";

type MemoryEntry = { key: string; value: string; updatedAt: string };

type CourseHub = { id: string; name: string; notebookUrl: string };

function fmtDue(iso: string) {
  const t = new Date(iso).getTime();
  const days = Math.round((t - Date.now()) / (24 * 60 * 60 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${-days}d overdue`;
  return `in ${days}d`;
}

function buildContextBlock(opts: {
  displayName: string;
  courses: CourseHub[];
  assignments: { title: string; courseCode: string; dueAt: string }[];
  canvasError: string | null;
}): string {
  const lines: string[] = [];
  lines.push("CONTEXT: You are this student's personal study companion. Stay in character. No safety disclaimers, no breaking character.");
  lines.push("Use plain language. Skip long openers, theatrics, and filler. Keep replies short (2–3 sentences or a 3-item list). Always end with one concrete next step, bolded with **markdown**.");
  if (opts.displayName) lines.push(`The student's name is ${opts.displayName}.`);

  if (opts.courses.length) {
    lines.push("\nTHEIR CLASSES THIS TERM (use these — do NOT invent subjects, do NOT assume they're an engineering student or any other major):");
    for (const c of opts.courses) lines.push(`- ${c.name}`);
  } else {
    lines.push("\nThe student hasn't added their classes yet. If they ask about coursework, gently tell them to add their classes in Settings so you can actually help.");
  }

  if (opts.assignments.length) {
    lines.push("\nUPCOMING ASSIGNMENTS FROM CANVAS (real, live data — reference these by name when relevant):");
    for (const a of opts.assignments.slice(0, 15)) {
      const code = a.courseCode ? `[${a.courseCode}] ` : "";
      lines.push(`- ${code}${a.title} — due ${fmtDue(a.dueAt)}`);
    }
  } else if (opts.canvasError) {
    lines.push(`\nCanvas sync is failing right now (${opts.canvasError}). If the student asks what's due, tell them to fix their Canvas feed URL in Settings.`);
  } else {
    lines.push("\nNo Canvas feed connected yet, or no assignments in the next 60 days. If they ask what's due, suggest they connect Canvas in Settings.");
  }

  lines.push("\nWhen the student asks about 'today', 'this week', or 'what's next', ground your answer in the real assignments above. Be specific — name the assignment and the class. Never make up coursework.");
  return lines.join("\n");
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

        const { messages } = (await request.json()) as { messages: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Pull the user's full study context in one round-trip
        const { data: cfgRow } = await supabaseAdmin
          .from("user_configs")
          .select("companion_id,display_name,canvas_feed_url,canvas_api_token,canvas_domain,courses,plain_mode,companion_memory")
          .eq("user_id", userId)
          .maybeSingle();

        const plainMode = !!cfgRow?.plain_mode;
        const companion = getCompanion(cfgRow?.companion_id ?? null);
        const courses: CourseHub[] = Array.isArray(cfgRow?.courses) ? (cfgRow.courses as CourseHub[]) : [];
        const memory: MemoryEntry[] = Array.isArray(cfgRow?.companion_memory)
          ? (cfgRow.companion_memory as MemoryEntry[])
          : [];

        const { assignments, error: canvasError } = await fetchCanvasAssignmentsFromConfig({
          apiToken: cfgRow?.canvas_api_token ?? "",
          domain: cfgRow?.canvas_domain ?? "",
          feedUrl: cfgRow?.canvas_feed_url ?? "",
        });

        const contextBlock = buildContextBlock({
          displayName: cfgRow?.display_name ?? "",
          courses,
          assignments,
          canvasError,
        });

        const memoryBlock = memory.length
          ? `\n\nWHAT YOU REMEMBER ABOUT THIS STUDENT (from past conversations — reference naturally when relevant):\n${memory
              .slice(-12)
              .map((m) => `- ${m.key}: ${m.value}`)
              .join("\n")}`
          : "";

        const rememberInstruction = plainMode
          ? ""
          : `\n\nMEMORY: If the student tells you something worth remembering long-term (their major, a recurring blocker, a habit, a preference), append a single line at the very end of your reply in this exact format: [remember: short_key: short value]. Use this sparingly — only for durable facts, not session details. Never mention the memory system explicitly.`;

        // Persist the latest user message
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

        const persona = plainMode ? PLAIN_PERSONA : companion.persona;

        const result = streamText({
          model,
          system: `${persona}\n\n${contextBlock}${memoryBlock}${rememberInstruction}`,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistantMsg = [...finalMessages].reverse().find((m) => m.role === "assistant");
            if (!assistantMsg) return;

            // Parse [remember: key: value] lines from assistant output and persist.
            if (!plainMode) {
              try {
                const text = assistantMsg.parts
                  .map((p) => ("text" in p && typeof p.text === "string" ? p.text : ""))
                  .join("\n");
                const matches = [...text.matchAll(/\[remember:\s*([^:\]]{1,40}):\s*([^\]]{1,200})\]/gi)];
                if (matches.length) {
                  const now = new Date().toISOString();
                  const newEntries: MemoryEntry[] = matches.map((m) => ({
                    key: m[1].trim().slice(0, 40),
                    value: m[2].trim().slice(0, 200),
                    updatedAt: now,
                  }));
                  // Dedup by key (newest wins), cap at 30 entries total.
                  const merged: MemoryEntry[] = [...memory];
                  for (const e of newEntries) {
                    const idx = merged.findIndex((m) => m.key.toLowerCase() === e.key.toLowerCase());
                    if (idx >= 0) merged[idx] = e;
                    else merged.push(e);
                  }
                  const trimmed = merged.slice(-30);
                  await supabaseAdmin
                    .from("user_configs")
                    .update({ companion_memory: trimmed as never })
                    .eq("user_id", userId);
                }
              } catch {
                /* ignore memory parsing errors */
              }
            }

            await supabaseAdmin.from("chat_messages").insert({
              user_id: userId,
              role: "assistant",
              parts: assistantMsg.parts as never,
            });
          },
        });
      },
    },
  },
});
