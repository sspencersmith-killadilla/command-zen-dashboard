import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Library } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listDecks, createDeck, deleteDeck } from "@/lib/recall.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/recall")({
  head: () => ({ meta: [{ title: "Recall — Command Center" }] }),
  component: RecallPage,
});

const KEY = ["decks"] as const;

function RecallPage() {
  const qc = useQueryClient();
  const list = useServerFn(listDecks);
  const create = useServerFn(createDeck);
  const remove = useServerFn(deleteDeck);
  const q = useQuery({ queryKey: KEY, queryFn: () => list() });
  const [title, setTitle] = useState("");
  const createMut = useMutation({
    mutationFn: () => create({ data: { title } }),
    onSuccess: () => { setTitle(""); qc.invalidateQueries({ queryKey: KEY }); toast.success("Deck created"); },
  });
  const delMut = useMutation({
    mutationFn: (deckId: string) => remove({ data: { deckId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="font-semibold flex items-center gap-2"><Library className="h-4 w-4" /> Active Recall</div>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-3">New deck</h2>
          <div className="flex gap-2">
            <Input placeholder="Deck title (e.g. Bio 101 — Mitosis)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button onClick={() => createMut.mutate()} disabled={!title || createMut.isPending}>
              <Plus className="h-4 w-4 mr-1.5" /> Create
            </Button>
          </div>
        </Card>
        {q.isLoading ? (
          <Card className="p-10 text-center text-muted-foreground">Loading…</Card>
        ) : (q.data ?? []).length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">No decks yet. Create one above.</Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(q.data ?? []).map((d) => (
              <Card key={d.id} className="p-4 flex items-center justify-between">
                <Link to="/recall/$deck" params={{ deck: d.id }} className="font-medium hover:text-primary">{d.title}</Link>
                <button onClick={() => delMut.mutate(d.id)} className="text-muted-foreground hover:text-destructive p-1.5">
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
