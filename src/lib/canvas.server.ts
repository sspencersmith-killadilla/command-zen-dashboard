// Server-only helpers for fetching Canvas assignments.
// Prefers the Canvas REST API (when the user has provided an access token +
// their Canvas domain) because that gives us assignment descriptions,
// per-assignment HTML links, and attached files. Falls back to the public
// .ics calendar feed when no API token is configured.

export type CanvasFile = { id: number; name: string; url: string };

export type ParsedAssignment = {
  id: string;
  title: string;
  courseCode: string;
  dueAt: string; // ISO
  htmlUrl?: string; // direct link to the assignment in Canvas
  files?: CanvasFile[]; // attachments parsed out of the description HTML
};

// ────────────────────────────────────────────────────────────────────────────
// ICS fallback (no token configured)
// ────────────────────────────────────────────────────────────────────────────

function unescapeIcs(s: string): string {
  return s.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseIcs(text: string): { uid: string; summary: string; dtstart?: string }[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const unfolded: string[] = [];
  for (const ln of lines) {
    if ((ln.startsWith(" ") || ln.startsWith("\t")) && unfolded.length) {
      unfolded[unfolded.length - 1] += ln.slice(1);
    } else {
      unfolded.push(ln);
    }
  }
  const events: { uid: string; summary: string; dtstart?: string }[] = [];
  let cur: Record<string, string> | null = null;
  for (const ln of unfolded) {
    if (ln === "BEGIN:VEVENT") cur = {};
    else if (ln === "END:VEVENT") {
      if (cur && cur.SUMMARY) {
        events.push({
          uid: cur.UID ?? cur.SUMMARY,
          summary: unescapeIcs(cur.SUMMARY),
          dtstart: cur.DTSTART ?? cur["DTSTART;VALUE=DATE"],
        });
      }
      cur = null;
    } else if (cur) {
      const idx = ln.indexOf(":");
      if (idx === -1) continue;
      const keyFull = ln.slice(0, idx);
      const value = ln.slice(idx + 1);
      const key = keyFull.split(";")[0];
      cur[key] = value;
      if (keyFull !== key) cur[keyFull] = value;
    }
  }
  return events;
}

function parseIcsDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh = "00", mm = "00", ss = "00", z] = m;
  const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}${z ? "Z" : ""}`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

function extractCourse(summary: string): { title: string; courseCode: string } {
  const m = summary.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (m) return { title: m[1].trim(), courseCode: m[2].trim() };
  return { title: summary.trim(), courseCode: "" };
}

async function fetchFromIcs(url: string): Promise<{ assignments: ParsedAssignment[]; error: string | null }> {
  if (!/^https?:\/\//i.test(url)) {
    return { assignments: [], error: "Canvas feed URL must start with http(s)://" };
  }
  let text: string;
  try {
    const res = await fetch(url, { headers: { Accept: "text/calendar" } });
    if (!res.ok) return { assignments: [], error: `Canvas returned ${res.status}` };
    text = await res.text();
  } catch (e) {
    return { assignments: [], error: e instanceof Error ? e.message : "Failed to fetch Canvas feed" };
  }

  const now = Date.now();
  const horizon = now + 60 * 24 * 60 * 60 * 1000;
  const events = parseIcs(text);
  const out: ParsedAssignment[] = [];
  for (const ev of events) {
    const dueIso = parseIcsDate(ev.dtstart);
    if (!dueIso) continue;
    const t = new Date(dueIso).getTime();
    if (t < now - 24 * 60 * 60 * 1000 || t > horizon) continue;
    const { title, courseCode } = extractCourse(ev.summary);
    out.push({ id: ev.uid, title, courseCode, dueAt: dueIso });
  }
  out.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return { assignments: out.slice(0, 25), error: null };
}

// ────────────────────────────────────────────────────────────────────────────
// Canvas REST API (preferred — full assignment data, links, files)
// ────────────────────────────────────────────────────────────────────────────

function normalizeDomain(raw: string): string {
  let d = raw.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  // Drop accidental trailing paths
  d = d.split("/")[0];
  return d;
}

type CanvasCourse = { id: number; name: string; course_code: string };
type CanvasAssignmentApi = {
  id: number;
  name: string;
  due_at: string | null;
  html_url: string;
  description: string | null;
};

function extractFilesFromDescription(html: string, domain: string): CanvasFile[] {
  if (!html) return [];
  const files: CanvasFile[] = [];
  const seen = new Set<number>();
  // Canvas wraps file links as /courses/:cid/files/:fid or /files/:fid
  const re = /\/(?:courses\/\d+\/)?files\/(\d+)(?:\/download)?(?:\?[^"'\s>]*)?["'\s>]/g;
  const titleRe = /<a[^>]+href="[^"]*\/files\/(\d+)[^"]*"[^>]*>([^<]+)<\/a>/gi;

  const titles = new Map<number, string>();
  for (const m of html.matchAll(titleRe)) {
    const id = Number(m[1]);
    if (!isNaN(id)) titles.set(id, m[2].trim());
  }
  for (const m of html.matchAll(re)) {
    const id = Number(m[1]);
    if (isNaN(id) || seen.has(id)) continue;
    seen.add(id);
    files.push({
      id,
      name: titles.get(id) ?? `File ${id}`,
      url: `https://${domain}/files/${id}/download?download_frd=1`,
    });
  }
  return files;
}

async function canvasGet<T>(domain: string, path: string, token: string): Promise<T> {
  const res = await fetch(`https://${domain}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Canvas API ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

async function fetchFromApi(
  domain: string,
  token: string,
): Promise<{ assignments: ParsedAssignment[]; error: string | null }> {
  try {
    const courses = await canvasGet<CanvasCourse[]>(
      domain,
      "/api/v1/courses?enrollment_state=active&per_page=50",
      token,
    );
    const now = Date.now();
    const horizon = now + 60 * 24 * 60 * 60 * 1000;
    const all: ParsedAssignment[] = [];

    await Promise.all(
      courses.map(async (course) => {
        try {
          const items = await canvasGet<CanvasAssignmentApi[]>(
            domain,
            `/api/v1/courses/${course.id}/assignments?bucket=upcoming&per_page=50&order_by=due_at`,
            token,
          );
          for (const a of items) {
            if (!a.due_at) continue;
            const t = new Date(a.due_at).getTime();
            if (isNaN(t) || t < now - 24 * 60 * 60 * 1000 || t > horizon) continue;
            all.push({
              id: String(a.id),
              title: a.name,
              courseCode: course.course_code || course.name,
              dueAt: new Date(a.due_at).toISOString(),
              htmlUrl: a.html_url,
              files: a.description ? extractFilesFromDescription(a.description, domain) : [],
            });
          }
        } catch {
          // Skip courses we can't read; keep going.
        }
      }),
    );

    all.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    return { assignments: all.slice(0, 25), error: null };
  } catch (e) {
    return {
      assignments: [],
      error: e instanceof Error ? e.message : "Canvas API request failed",
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Unified entry point
// ────────────────────────────────────────────────────────────────────────────

export async function fetchCanvasAssignmentsFromConfig(opts: {
  apiToken?: string;
  domain?: string;
  feedUrl?: string;
}): Promise<{ assignments: ParsedAssignment[]; error: string | null }> {
  const token = opts.apiToken?.trim() ?? "";
  const domain = opts.domain ? normalizeDomain(opts.domain) : "";
  if (token && domain) return fetchFromApi(domain, token);

  const feed = opts.feedUrl?.trim() ?? "";
  if (feed) return fetchFromIcs(feed);
  return { assignments: [], error: null };
}

/** Legacy ICS-only entry point (kept for callers that still pass a feed URL). */
export async function fetchCanvasAssignmentsFromUrl(
  url: string,
): Promise<{ assignments: ParsedAssignment[]; error: string | null }> {
  if (!url) return { assignments: [], error: null };
  return fetchFromIcs(url);
}
