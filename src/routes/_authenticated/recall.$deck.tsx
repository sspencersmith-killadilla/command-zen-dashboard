import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDeckWithCards, addCard, gradeCard, generateCardsFromNotes, type Card as FCard } from "@/lib/recall.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/recall/$deck")({
  head: () => ({ meta: [{ title: "Review — Command Center" }] }),
  component: DeckPage,
});

function DeckPage() {
  const { deck: deckId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchDeck = useServerFn(getDeckWithCards);
  const addCardFn = useServerFn(addCard);
  const gradeFn = useServerFn(gradeCard);
  const genFn = useServerFn(generateCardsFromNotes);

  const KEY = ["deck", deckId] as const;
  const q = useQuery({ queryKey: KEY, queryFn: () => fetchDeck({ data: { deckId } }) });

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [notes, setNotes] = useState("");
  const [showBack, setShowBack] = useState(false);

  const dueCards = useMemo(() => {
    const now = Date.now();
    return (q.data?.cards ?? []).filter((c) => new Date(c.due_at).getTime() <= now);
  }, [q.data]);
  const current: FCard | undefined = dueCards[0];

  const addMut = useMutation({
    mutationFn: () => addCardFn({ data: { deckId, front, back } }),
    onSuccess: () => { setFront(""); setBack(""); qc.invalidateQueries({ queryKey: KEY }); },
  });
  const gradeMut = useMutation({
    mutationFn: (quality: number) => gradeFn({ data: { cardId: current!.id, quality } }),
    onSuccess: () => { setShowBack(false); qc.invalidateQueries({ queryKey: KEY }); },
  });
  const genMut = useMutation({
    mutationFn: () => genFn({ data: { deckId, sourceText: notes } }),
    onSuccess: (res) => { setNotes(""); qc.invalidateQueries({ queryKey: KEY }); toast.success(`Generated ${res.created} cards`); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate({ to: "/recall" })} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Decks
          </button>
          <div className="font-semibold">{q.data?.deck.title ?? "Deck"}</div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <Card className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
          {current ? (
            <>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{dueCards.length} due</div>
              <div className="text-xl font-medium mb-4">{current.front}</div>
              {showBack ? (
                <>
                  <div className="text-base text-muted-foreground mb-4 border-t pt-4 w-full">{current.back}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => gradeMut.mutate(1)}>Again</Button>
                    <Button onClick={() => gradeMut.mutate(4)}>Good</Button>
                    <Button variant="secondary" onClick={() => gradeMut.mutate(5)}>Easy</Button>
                  </div>
                </>
              ) : (
                <Button onClick={() => setShowBack(true)}>Show answer</Button>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">All caught up. Add more cards below.</div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Add card</h3>
          <div className="space-y-2">
            <Input placeholder="Front" value={front} onChange={(e) => setFront(e.target.value)} />
            <Textarea placeholder="Back" value={back} onChange={(e) => setBack(e.target.value)} rows={2} />
            <Button onClick={() => addMut.mutate()} disabled={!front || !back || addMut.isPending}>
              <Plus className="h-4 w-4 mr-1.5" /> Add
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate from notes</h3>
          <p className="text-sm text-muted-foreground mb-3">Paste lecture notes; AI will turn them into flashcards.</p>
          <Textarea placeholder="Paste notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
          <Button className="mt-2" onClick={() => genMut.mutate()} disabled={notes.length < 20 || genMut.isPending}>
            {genMut.isPending ? "Generating…" : "Generate cards"}
          </Button>
        </Card>
      </main>
    </div>
  );
}
