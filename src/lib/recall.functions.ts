import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateDeckCardsFromText } from "./recall.server";

export type Deck = {
  id: string;
  title: string;
  course_id: string | null;
  source: string;
  description: string | null;
  created_at: string;
};

export type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  ease: number;
  interval_days: number;
  reps: number;
  due_at: string;
  last_reviewed_at: string | null;
};

const DECK_SELECT = "id,title,course_id,source,description,created_at";
const CARD_SELECT = "id,deck_id,front,back,ease,interval_days,reps,due_at,last_reviewed_at";

export const listDecks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("flashcard_decks")
      .select(DECK_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Deck[];
  });

export const getDeckWithCards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ deckId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: deck, error: dErr } = await supabase
      .from("flashcard_decks")
      .select(DECK_SELECT)
      .eq("id", data.deckId)
      .eq("user_id", userId)
      .maybeSingle();
    if (dErr) throw new Error(dErr.message);
    if (!deck) throw new Error("Deck not found");
    const { data: cards, error: cErr } = await supabase
      .from("flashcard_cards")
      .select(CARD_SELECT)
      .eq("deck_id", data.deckId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (cErr) throw new Error(cErr.message);
    return { deck: deck as Deck, cards: (cards ?? []) as Card[] };
  });

const createDeckSchema = z.object({
  title: z.string().min(1).max(200),
  course_id: z.string().max(120).optional(),
  description: z.string().max(1000).optional(),
});

export const createDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createDeckSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: userId,
        title: data.title,
        course_id: data.course_id ?? null,
        description: data.description ?? null,
        source: "manual",
      })
      .select(DECK_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as Deck;
  });

export const deleteDeck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ deckId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("flashcard_decks")
      .delete()
      .eq("id", data.deckId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const addCardSchema = z.object({
  deckId: z.string().uuid(),
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(4000),
});

export const addCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => addCardSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("flashcard_cards")
      .insert({
        user_id: userId,
        deck_id: data.deckId,
        front: data.front,
        back: data.back,
      })
      .select(CARD_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as Card;
  });

const gradeSchema = z.object({
  cardId: z.string().uuid(),
  quality: z.number().int().min(0).max(5), // 0=again, 4=good, 5=easy
});

/** Simplified SM-2 spaced repetition. */
export const gradeCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => gradeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cur, error: cErr } = await supabase
      .from("flashcard_cards")
      .select(CARD_SELECT)
      .eq("id", data.cardId)
      .eq("user_id", userId)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!cur) throw new Error("Card not found");

    const q = data.quality;
    let { ease, interval_days, reps } = cur as Card;
    if (q < 3) {
      reps = 0;
      interval_days = 1;
    } else {
      if (reps === 0) interval_days = 1;
      else if (reps === 1) interval_days = 6;
      else interval_days = Math.round(interval_days * ease);
      reps += 1;
    }
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    const due = new Date(Date.now() + interval_days * 86_400_000).toISOString();

    const { data: row, error } = await supabase
      .from("flashcard_cards")
      .update({
        ease,
        interval_days,
        reps,
        due_at: due,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.cardId)
      .eq("user_id", userId)
      .select(CARD_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as Card;
  });

const genSchema = z.object({
  deckId: z.string().uuid(),
  sourceText: z.string().min(20).max(20000),
  count: z.number().int().min(3).max(25).optional(),
});

/** Use Lovable AI to generate Q/A cards from pasted notes. */
export const generateCardsFromNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => genSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify deck ownership
    const { data: deck, error: dErr } = await supabase
      .from("flashcard_decks")
      .select("id")
      .eq("id", data.deckId)
      .eq("user_id", userId)
      .maybeSingle();
    if (dErr) throw new Error(dErr.message);
    if (!deck) throw new Error("Deck not found");

    const cards = await generateDeckCardsFromText(data.sourceText, data.count ?? 10);
    if (cards.length === 0) return { created: 0 };

    const rows = cards.map((c) => ({
      user_id: userId,
      deck_id: data.deckId,
      front: c.front,
      back: c.back,
    }));
    const { error } = await supabase.from("flashcard_cards").insert(rows);
    if (error) throw new Error(error.message);
    return { created: rows.length };
  });
