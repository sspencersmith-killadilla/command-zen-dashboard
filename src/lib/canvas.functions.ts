import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CanvasAssignment = {
  id: string;
  title: string;
  courseCode: string;
  dueAt: string; // ISO
};

// Minimal ICS parser — handles line unfolding and common VEVENT fields.
function parseIcs(text: string): { uid: string; summary: string; dtstart?: string; description?: string; location?: string }[] {
  // Unfold continuation lines (RFC5545): a line starting with space/tab continues the previous.
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const unfolded: string[] = [];
  for (const ln of lines) {
    if ((ln.startsWith(" ") || ln.startsWith("\t")) && unfolded.length) {
      unfolded[unfolded.length - 1] += ln.slice(1);
    } else {
      unfolded.push(ln);
    }
  }

  const events: { uid: string; summary: string; dtstart?: string; description?: string; location?: string }[] = [];
  let cur: Record<string, string> | null = null;
  for (const ln of unfolded) {
    if (ln === "BEGIN:VEVENT") {
      cur = {};
    } else if (ln === "END:VEVENT") {
      if (cur && cur.SUMMARY) {
        events.push({
          uid: cur.UID ?? cur.SUMMARY,
          summary: unescapeIcs(cur.SUMMARY),
          dtstart: cur.DTSTART ?? cur["DTSTART;VALUE=DATE"],
          description: cur.DESCRIPTION ? unescapeIcs(cur.DESCRIPTION) : undefined,
          location: cur.LOCATION ? unescapeIcs(cur.LOCATION) : undefined,
        });
      }
      cur = null;
    } else if (cur) {
      // KEY[;params]:VALUE
      const idx = ln.indexOf(":");
      if (idx === -1) continue;
      const keyFull = ln.slice(0, idx);
      const value = ln.slice(idx + 1);
      const key = keyFull.split(";")[0];
      // For DTSTART with TZ params, keep the param suffix as a separate key too
      cur[key] = value;
      if (keyFull !== key) cur[keyFull] = value;
    }
  }
  return events;
}

function unescapeIcs(s: string): string {
  return s.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

// "20260603T235900Z" or "20260603" → ISO
function parseIcsDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh = "00", mm = "00", ss = "00", z] = m;
  const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}${z ? "Z" : ""}`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

// Canvas usually formats SUMMARY as "Assignment Title [COURSE CODE]"
function extractCourse(summary: string): { title: string; courseCode: string } {
  const m = summary.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (m) return { title: m[1].trim(), courseCode: m[2].trim() };
  return { title: summary.trim(), courseCode: "" };
}

export const fetchCanvasAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ assignments: CanvasAssignment[]; error: string | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_configs")
      .select("canvas_feed_url")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { assignments: [], error: error.message };
    const url = data?.canvas_feed_url?.trim();
    if (!url) return { assignments: [], error: null };
    if (!/^https?:\/\//i.test(url)) return { assignments: [], error: "Canvas feed URL must start with http(s)://" };

    let text: string;
    try {
      const res = await fetch(url, { headers: { Accept: "text/calendar" } });
      if (!res.ok) return { assignments: [], error: `Canvas returned ${res.status}` };
      text = await res.text();
    } catch (e) {
      return { assignments: [], error: e instanceof Error ? e.message : "Failed to fetch Canvas feed" };
    }

    const now = Date.now();
    const horizon = now + 60 * 24 * 60 * 60 * 1000; // next 60 days
    const events = parseIcs(text);
    const assignments: CanvasAssignment[] = [];
    for (const ev of events) {
      const dueIso = parseIcsDate(ev.dtstart);
      if (!dueIso) continue;
      const t = new Date(dueIso).getTime();
      if (t < now - 24 * 60 * 60 * 1000 || t > horizon) continue;
      const { title, courseCode } = extractCourse(ev.summary);
      assignments.push({ id: ev.uid, title, courseCode, dueAt: dueIso });
    }
    assignments.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    return { assignments: assignments.slice(0, 25), error: null };
  });
