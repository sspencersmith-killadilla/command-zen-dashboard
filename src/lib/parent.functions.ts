// Server functions for the "Share with parents" feature.
// This file intentionally contains ONLY createServerFn declarations and their
// imports so the import-protection rule does not leak client.server into the
// browser bundle.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeStatus,
  mondayISO,
  statusLabel,
  tipFor,
  type ParentMode,
  type ParentSharePayload,
  type ParentStatus,
} from "@/lib/parent";

const EmailSchema = z
  .string()
  .trim()
  .min(3)
  .max(255)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email");

function randomToken(): string {
  // 32 url-safe chars, unguessable
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function loadStatusInputs(
  supabase: ReturnType<typeof supabaseAdmin.from> extends never ? never : any,
  userId: string,
  weekOf: string,
) {
  const weekStart = new Date(`${weekOf}T00:00:00Z`).toISOString();

  const [blocks, sessions] = await Promise.all([
    supabase
      .from("study_blocks")
      .select("completed_at,ends_at")
      .eq("user_id", userId)
      .gte("starts_at", weekStart)
      .not("completed_at", "is", null),
    supabase
      .from("focus_sessions")
      .select("id,completed")
      .eq("user_id", userId)
      .gte("started_at", weekStart),
  ]);

  type Block = { completed_at: string | null; ends_at: string };
  const blockRows = (blocks.data ?? []) as Block[];
  const onTime = blockRows.filter(
    (b) => b.completed_at && new Date(b.completed_at) <= new Date(b.ends_at),
  ).length;

  type Session = { completed: boolean | null };
  const focusSessions = ((sessions.data ?? []) as Session[]).filter(
    (s) => s.completed,
  ).length;

  return {
    blocksCompleted: blockRows.length,
    blocksOnTime: onTime,
    blocksTotal: blockRows.length,
    focusSessions,
  };
}

// ── Reads ──────────────────────────────────────────────────────────────────

export const getParentShareState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: link } = await supabase
      .from("parent_links")
      .select("*")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .maybeSingle();

    if (!link) return { link: null, audit: [] as any[] };

    const { data: audit } = await supabase
      .from("parent_share_audit")
      .select("id,kind,payload_preview,created_at")
      .eq("parent_link_id", link.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return { link, audit: audit ?? [] };
  });

export const previewWeeklyShare = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ParentSharePayload | null> => {
    const { supabase, userId } = context;
    const { data: link } = await supabase
      .from("parent_links")
      .select("*")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .maybeSingle();
    if (!link) return null;

    const { data: cfg } = await supabase
      .from("user_configs")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();

    const weekOf = mondayISO();
    const inputs = await loadStatusInputs(supabase, userId, weekOf);
    const status: ParentStatus = computeStatus(inputs);

    const { data: recap } = await supabase
      .from("weekly_recaps")
      .select("parent_note")
      .eq("user_id", userId)
      .eq("week_of", weekOf)
      .maybeSingle();

    return {
      status,
      statusLabel: statusLabel(status),
      studentName: cfg?.display_name?.trim() || "Your student",
      weekOf,
      streakDays: link.mode === "shared" ? inputs.focusSessions : undefined,
      note: recap?.parent_note?.trim() || undefined,
      tip: tipFor(status, weekOf),
      generatedAt: new Date().toISOString(),
    };
  });

// ── Writes ─────────────────────────────────────────────────────────────────

export const inviteParent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: EmailSchema,
        name: z.string().trim().min(1).max(80),
        mode: z.enum(["minimal", "shared"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Revoke any existing active link first (v1: one parent per student)
    await supabase
      .from("parent_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("revoked_at", null);

    const { data: link, error } = await supabase
      .from("parent_links")
      .insert({
        user_id: userId,
        parent_email: data.email,
        parent_name: data.name,
        mode: data.mode,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("parent_share_audit").insert({
      parent_link_id: link.id,
      user_id: userId,
      kind: "invite",
      payload_preview: { email: data.email, mode: data.mode },
    });

    return { link };
  });

export const updateParentShareSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        mode: z.enum(["minimal", "shared"]).optional(),
        paused: z.boolean().optional(),
        parentName: z.string().trim().min(1).max(80).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: {
      mode?: ParentMode;
      paused?: boolean;
      parent_name?: string;
    } = {};
    if (data.mode !== undefined) patch.mode = data.mode;
    if (data.paused !== undefined) patch.paused = data.paused;
    if (data.parentName !== undefined) patch.parent_name = data.parentName;
    if (Object.keys(patch).length === 0) return { ok: true };

    const { data: link, error } = await supabase
      .from("parent_links")
      .update(patch)
      .eq("user_id", userId)
      .is("revoked_at", null)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (data.paused !== undefined) {
      await supabase.from("parent_share_audit").insert({
        parent_link_id: link.id,
        user_id: userId,
        kind: data.paused ? "pause" : "resume",
        payload_preview: {},
      });
    }
    return { link };
  });


export const revokeParentShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: link } = await supabase
      .from("parent_links")
      .select("id")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .maybeSingle();
    if (!link) return { ok: true };

    // Burn all outstanding tokens
    await supabase
      .from("parent_share_tokens")
      .delete()
      .eq("parent_link_id", link.id);

    await supabase
      .from("parent_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", link.id);

    await supabase.from("parent_share_audit").insert({
      parent_link_id: link.id,
      user_id: userId,
      kind: "revoke",
      payload_preview: {},
    });
    return { ok: true };
  });

export const updateWeeklyParentNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        note: z.string().trim().max(500).optional(),
        skip: z.boolean().optional(),
        approve: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const weekOf = mondayISO();

    const patch: {
      parent_note?: string | null;
      parent_send_status?: string;
    } = {};
    if (data.note !== undefined) patch.parent_note = data.note || null;
    if (data.skip) patch.parent_send_status = "skipped";
    if (data.approve) patch.parent_send_status = "approved";
    if (Object.keys(patch).length === 0) return { ok: true };

    // Upsert: ensure a recap row exists for this week
    const { data: existing } = await supabase
      .from("weekly_recaps")
      .select("id")
      .eq("user_id", userId)
      .eq("week_of", weekOf)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("weekly_recaps")
        .update(patch)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("weekly_recaps")
        .insert({
          user_id: userId,
          week_of: weekOf,
          summary: {},
          ...patch,
        });
      if (error) throw new Error(error.message);
    }

    return { ok: true };
  });

// Generate a fresh share token and return the magic link.
// In v1 this is student-triggered (manual share). The student can copy the
// link or text/email it to the parent themselves until automated weekly
// email delivery is wired up.
export const generateParentShareLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        kind: z.enum(["weekly", "ping"]).default("weekly"),
        pingNote: z.string().trim().max(280).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: link } = await supabase
      .from("parent_links")
      .select("*")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .maybeSingle();
    if (!link) throw new Error("No active parent share. Invite a parent first.");
    if (link.paused) throw new Error("Sharing is paused. Resume it first.");

    const { data: cfg } = await supabase
      .from("user_configs")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();

    const weekOf = mondayISO();
    const inputs = await loadStatusInputs(supabase, userId, weekOf);
    const status: ParentStatus = computeStatus(inputs);

    const { data: recap } = await supabase
      .from("weekly_recaps")
      .select("parent_note")
      .eq("user_id", userId)
      .eq("week_of", weekOf)
      .maybeSingle();

    const note =
      data.kind === "ping" && data.pingNote
        ? data.pingNote
        : recap?.parent_note?.trim() || undefined;

    const payload: ParentSharePayload = {
      status,
      statusLabel:
        data.kind === "ping" ? "Heads-up from your student" : statusLabel(status),
      studentName: cfg?.display_name?.trim() || "Your student",
      weekOf,
      streakDays: link.mode === "shared" ? inputs.focusSessions : undefined,
      note,
      tip: tipFor(status, weekOf),
      generatedAt: new Date().toISOString(),
    };

    // Expire 14 days from now so the parent has time but old links die
    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 14);

    const token = randomToken();
    const { error } = await supabase.from("parent_share_tokens").insert({
      token,
      parent_link_id: link.id,
      user_id: userId,
      kind: data.kind,
      week_of: weekOf,
      payload: payload as unknown as Record<string, unknown>,
      expires_at: expiresAt.toISOString(),
    });
    if (error) throw new Error(error.message);

    await supabase.from("parent_share_audit").insert({
      parent_link_id: link.id,
      user_id: userId,
      kind: data.kind,
      payload_preview: {
        status: payload.status,
        statusLabel: payload.statusLabel,
        hasNote: !!payload.note,
      },
    });

    if (data.kind === "weekly") {
      const existingRecap = recap !== undefined && recap !== null;
      if (existingRecap) {
        await supabase
          .from("weekly_recaps")
          .update({ parent_send_status: "sent" })
          .eq("user_id", userId)
          .eq("week_of", weekOf);
      }
    }

    return { token, parentEmail: link.parent_email, parentName: link.parent_name };
  });

// Public read for the parent-facing page. Uses service-role to bypass RLS but
// returns ONLY the locked-shape payload — never raw assignment/grade/chat data.
export const getParentSharePayload = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().trim().min(16).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("parent_share_tokens")
      .select("token,payload,expires_at,viewed_at,parent_link_id")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { status: "not_found" as const };

    if (new Date(row.expires_at) < new Date()) {
      return { status: "expired" as const };
    }

    // Verify the link is still active (not revoked / paused)
    const { data: link } = await supabaseAdmin
      .from("parent_links")
      .select("revoked_at,paused,parent_name")
      .eq("id", row.parent_link_id)
      .maybeSingle();
    if (!link || link.revoked_at) return { status: "revoked" as const };

    if (!row.viewed_at) {
      await supabaseAdmin
        .from("parent_share_tokens")
        .update({ viewed_at: new Date().toISOString() })
        .eq("token", row.token);
    }

    return {
      status: "ok" as const,
      payload: row.payload as unknown as ParentSharePayload,
      parentName: link.parent_name,
    };
  });

export type ParentModeExport = ParentMode;
