import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Trash2,
  PauseCircle,
  PlayCircle,
  Send,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  getParentShareState,
  inviteParent,
  updateParentShareSettings,
  revokeParentShare,
  generateParentShareLink,
  previewWeeklyShare,
  updateWeeklyParentNote,
} from "@/lib/parent.functions";

const parentStateKey = ["parent-share-state"];
const parentPreviewKey = ["parent-share-preview"];

export function ParentSharePanel() {
  const qc = useQueryClient();
  const fetchState = useServerFn(getParentShareState);
  const fetchPreview = useServerFn(previewWeeklyShare);
  const invite = useServerFn(inviteParent);
  const updateSettings = useServerFn(updateParentShareSettings);
  const revoke = useServerFn(revokeParentShare);
  const genLink = useServerFn(generateParentShareLink);
  const updateNote = useServerFn(updateWeeklyParentNote);

  const { data: state } = useQuery({
    queryKey: parentStateKey,
    queryFn: () => fetchState(),
  });
  const { data: preview } = useQuery({
    queryKey: parentPreviewKey,
    queryFn: () => fetchPreview(),
    enabled: !!state?.link && !state.link.paused,
  });

  const inviteMut = useMutation({
    mutationFn: (input: {
      email: string;
      name: string;
      mode: "minimal" | "shared";
    }) => invite({ data: input }),
    onSuccess: () => {
      toast.success("Parent share set up");
      qc.invalidateQueries({ queryKey: parentStateKey });
      qc.invalidateQueries({ queryKey: parentPreviewKey });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const settingsMut = useMutation({
    mutationFn: (input: {
      mode?: "minimal" | "shared";
      paused?: boolean;
      parentName?: string;
    }) => updateSettings({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentStateKey }),
  });


  const revokeMut = useMutation({
    mutationFn: () => revoke(),
    onSuccess: () => {
      toast.success("Sharing turned off");
      qc.invalidateQueries({ queryKey: parentStateKey });
    },
  });

  const linkMut = useMutation({
    mutationFn: (input: {
      kind: "weekly" | "ping";
      pingNote?: string;
    }) => genLink({ data: input }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const noteMut = useMutation({
    mutationFn: (input: { note?: string; skip?: boolean; approve?: boolean }) =>
      updateNote({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: parentPreviewKey }),
  });

  if (!state) return null;

  if (!state.link) {
    return <InviteForm onSubmit={(v) => inviteMut.mutate(v)} busy={inviteMut.isPending} />;
  }

  const link = state.link;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const generated = linkMut.data
    ? `${origin}/p/${linkMut.data.token}`
    : null;

  return (
    <Card className="p-6 space-y-5 border-border/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-lg">Share with parents</h2>
          <p className="text-sm text-muted-foreground">
            Sharing weekly status with{" "}
            <span className="text-foreground font-medium">
              {link.parent_name || link.parent_email}
            </span>
            .
          </p>
        </div>
        <Badge variant={link.paused ? "secondary" : "default"}>
          {link.paused ? "Paused" : "Active"}
        </Badge>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm space-y-1.5">
        <p className="font-medium text-foreground">What they see</p>
        <ul className="text-muted-foreground space-y-1 list-disc pl-5">
          <li>A weekly green / yellow / red status — that's it.</li>
          <li>
            {link.mode === "shared"
              ? "Count of focused study sessions."
              : "No counts, no streak number."}
          </li>
          <li>Any note you write below (optional).</li>
          <li>A generic "how to help" tip for the week.</li>
        </ul>
        <p className="text-xs text-muted-foreground pt-2">
          They never see assignment names, grades, chats, focus sessions, or
          wellness logs. Ever.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <div className="flex rounded-lg border border-border/60 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => settingsMut.mutate({ mode: "minimal" })}
              className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${
                link.mode === "minimal"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minimal
            </button>
            <button
              type="button"
              onClick={() => settingsMut.mutate({ mode: "shared" })}
              className={`flex-1 px-3 py-1.5 rounded-md transition-colors ${
                link.mode === "shared"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Family
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {link.mode === "minimal"
              ? "Just the traffic light + your note."
              : "Adds focus session count to the digest."}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Pause sharing</Label>
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {link.paused ? "Paused — no emails sent." : "Active."}
            </span>
            <Switch
              checked={link.paused}
              onCheckedChange={(v) => settingsMut.mutate({ paused: v })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pausing does not notify them.
          </p>
        </div>
      </div>

      {!link.paused && preview && (
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">This week's status</p>
              <p className="text-xs text-muted-foreground">
                What they'd see right now.
              </p>
            </div>
            <StatusPill status={preview.status} label={preview.statusLabel} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-note">
              Optional note for {link.parent_name || "them"}
            </Label>
            <Textarea
              id="parent-note"
              placeholder="e.g. Big project due Friday, I've got it handled."
              defaultValue={preview.note ?? ""}
              maxLength={500}
              rows={2}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (preview.note ?? "")) noteMut.mutate({ note: v });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Saved automatically. Leave blank to send no note.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => linkMut.mutate({ kind: "weekly" })}
              disabled={linkMut.isPending}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Generate share link
            </Button>
            <PingButton
              onSend={(note) => linkMut.mutate({ kind: "ping", pingNote: note })}
              busy={linkMut.isPending}
            />
          </div>

          {generated && (
            <CopyLink url={generated} parentEmail={link.parent_email} />
          )}
        </div>
      )}

      {state.audit.length > 0 && (
        <details className="pt-2 border-t border-border/60">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            <Eye className="h-3.5 w-3.5 inline mr-1.5" />
            What I've shared ({state.audit.length})
          </summary>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {state.audit.map((row) => {
              const preview = (row.payload_preview ?? {}) as { statusLabel?: string };
              return (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <span>
                  <span className="font-medium text-foreground">{row.kind}</span>
                  {preview.statusLabel && <span> — {preview.statusLabel}</span>}
                </span>

                <span className="tabular-nums">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </li>
              );
            })}
          </ul>
        </details>
      )}

      <div className="pt-3 border-t border-border/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (
              confirm(
                "Turn off sharing with this parent? Their existing link will stop working immediately.",
              )
            ) {
              revokeMut.mutate();
            }
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Stop sharing with this parent
        </Button>
      </div>
    </Card>
  );
}

function InviteForm({
  onSubmit,
  busy,
}: {
  onSubmit: (v: { email: string; name: string; mode: "minimal" | "shared" }) => void;
  busy: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"minimal" | "shared">("minimal");

  return (
    <Card className="p-6 space-y-4 border-border/60">
      <div>
        <h2 className="font-semibold text-lg">Share with parents</h2>
        <p className="text-sm text-muted-foreground max-w-lg">
          A privacy-first weekly check-in. You stay in control of what they see
          and when. They never see grades, assignment names, your chats, or
          your wellness logs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="parent-name">Their name</Label>
          <Input
            id="parent-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mom"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parent-email">Their email</Label>
          <Input
            id="parent-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Mode</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("minimal")}
            className={`text-left rounded-lg border p-3 transition-colors ${
              mode === "minimal"
                ? "border-primary bg-primary/5"
                : "border-border/60 hover:border-border"
            }`}
          >
            <div className="font-medium text-sm flex items-center gap-1.5">
              Minimal
              {mode === "minimal" && <Check className="h-3.5 w-3.5 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Traffic light + optional note. Nothing else.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("shared")}
            className={`text-left rounded-lg border p-3 transition-colors ${
              mode === "shared"
                ? "border-primary bg-primary/5"
                : "border-border/60 hover:border-border"
            }`}
          >
            <div className="font-medium text-sm flex items-center gap-1.5">
              Family
              {mode === "shared" && <Check className="h-3.5 w-3.5 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adds focus session count. Still no assignment data.
            </p>
          </button>
        </div>
      </div>

      <Button
        onClick={() => onSubmit({ email: email.trim(), name: name.trim(), mode })}
        disabled={busy || !email.trim() || !name.trim()}
      >
        Set up sharing
      </Button>

      <p className="text-xs text-muted-foreground">
        You can pause or turn off sharing at any time, no notification sent.
      </p>
    </Card>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: "green" | "yellow" | "red";
  label: string;
}) {
  const dot =
    status === "green"
      ? "bg-emerald-500"
      : status === "yellow"
        ? "bg-amber-500"
        : "bg-rose-500";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function CopyLink({
  url,
  parentEmail,
}: {
  url: string;
  parentEmail: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        Share link generated. It expires in 14 days. Send it to{" "}
        <span className="text-foreground font-medium">{parentEmail}</span>:
      </p>
      <div className="flex gap-2">
        <Input value={url} readOnly className="text-xs font-mono" />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.location.href = `mailto:${parentEmail}?subject=${encodeURIComponent(
              "My weekly check-in",
            )}&body=${encodeURIComponent(
              `Hi — here's this week's check-in:\n\n${url}\n\nThe link works for 14 days.`,
            )}`;
          }}
        >
          Email
        </Button>
      </div>
    </div>
  );
}

function PingButton({
  onSend,
  busy,
}: {
  onSend: (note: string) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        Send a heads-up
      </Button>
    );
  }
  return (
    <div className="w-full flex flex-col gap-2 sm:flex-row sm:items-start">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="One line of context (optional)"
        maxLength={280}
        rows={2}
        className="flex-1"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            onSend(note.trim());
            setOpen(false);
            setNote("");
          }}
          disabled={busy}
        >
          Generate
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export { PauseCircle, PlayCircle };
