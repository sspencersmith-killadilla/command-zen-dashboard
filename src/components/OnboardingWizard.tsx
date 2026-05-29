import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, Calendar, Link2, BookOpen, Check, Plus, Trash2, ArrowRight } from "lucide-react";
import type { CourseHub, WinstonConfig } from "@/lib/winston-store";
import { startGoogleCalendarConnect } from "@/lib/google-calendar.functions";
import { toast } from "sonner";

type Props = {
  initial: WinstonConfig;
  onComplete: (cfg: Partial<WinstonConfig>) => void;
};

export function OnboardingWizard({ initial, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [canvasUrl, setCanvasUrl] = useState(initial.canvasFeedUrl);
  const googleConnected = initial.googleConnected;
  const [courses, setCourses] = useState<CourseHub[]>(
    initial.courses.length ? initial.courses : []
  );
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  const steps = ["Welcome", "Canvas", "Google", "Notebooks"];
  const progress = ((step + 1) / steps.length) * 100;

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
    else
      onComplete({
        onboarded: true,
        displayName: displayName.trim() || "Friend",
        canvasFeedUrl: canvasUrl,
        googleConnected,
        courses,
      });
  }

  function addCourse() {
    if (!draftName.trim() || !draftUrl.trim()) return;
    setCourses([
      ...courses,
      { id: crypto.randomUUID(), name: draftName.trim(), notebookUrl: draftUrl.trim() },
    ]);
    setDraftName("");
    setDraftUrl("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-xl">
        {/* progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-[image:var(--gradient-hero)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card
          key={step}
          className="p-8 md:p-10 animate-fade-up border-border/60"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-hero)] animate-pop-in">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                  Welcome to your Command Center.
                </h1>
                <p className="text-lg text-muted-foreground">
                  First — what should we call you?
                </p>
              </div>
              <div className="max-w-sm mx-auto text-left space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  autoFocus
                  placeholder="e.g. Winston"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground text-left space-y-2 max-w-md mx-auto">
                <p className="font-medium text-foreground">Next, you'll connect three things:</p>
                <ul className="space-y-1.5">
                  <li><span className="font-medium text-foreground">1. Canvas</span> — so every assignment shows up here automatically.</li>
                  <li><span className="font-medium text-foreground">2. Google Calendar</span> — so the Command Center can send you smart reminders.</li>
                  <li><span className="font-medium text-foreground">3. NotebookLM</span> — one notebook per class, for instant study help.</li>
                </ul>
                <p className="pt-1">Takes about 3 minutes. After this, you barely touch it.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Header
                icon={<Calendar />}
                title="Sync your Canvas calendar"
                subtitle="Pulls every assignment due date into one timeline — no more checking five class pages."
              />
              <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground mb-1.5">Step-by-step:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Open Canvas and sign in</li>
                    <li>Click <span className="font-medium">Calendar</span> in the left sidebar</li>
                    <li>Scroll to the bottom-right and click <span className="font-medium">Calendar Feed</span></li>
                    <li>A popup shows a long URL ending in <code className="text-xs bg-background px-1.5 py-0.5 rounded">.ics</code> — copy it</li>
                    <li>Paste it below</li>
                  </ol>
                </div>
                <p className="text-xs">
                  <span className="font-medium text-foreground">Privacy:</span> this is a read-only feed. Nothing can be changed in Canvas from here.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="canvas">Canvas feed URL</Label>
                <Input
                  id="canvas"
                  placeholder="https://canvas.../feeds/calendars/...ics"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Header
                icon={<Link2 />}
                title="Google Calendar"
                subtitle="Tiered reminders — a heads-up days out, a nudge the night before, a final ping the morning of."
              />
              <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">What this does:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Writes assignment reminders directly to your existing Google Calendar</li>
                  <li>Powers the Daily Reset prompt (the Gemini briefing references real events)</li>
                  <li>You can revoke access anytime from your Google account settings</li>
                </ul>
              </div>
              <div
                className={`w-full rounded-xl border p-5 flex items-center gap-4 ${
                  googleConnected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${googleConnected ? "bg-accent" : "bg-muted"}`}>
                  {googleConnected ? (
                    <Check className="h-5 w-5 text-accent-foreground animate-check-pop" />
                  ) : (
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-foreground">
                    {googleConnected ? "Signed in with Google" : "Not signed in with Google"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {googleConnected
                      ? "We'll use this account for Calendar reminders."
                      : "Sign out and use \"Continue with Google\" on the login page to enable Calendar."}
                  </div>
                </div>
              </div>
            </div>
          )}


          {step === 3 && (
            <div className="space-y-6">
              <Header
                icon={<BookOpen />}
                title="Your class notebooks"
                subtitle="Each class gets its own NotebookLM hub — your second brain for that course."
              />
              <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground mb-1.5">Don't have notebooks yet?</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Go to <a href="https://notebooklm.google.com" target="_blank" rel="noreferrer" className="underline text-primary">notebooklm.google.com</a></li>
                    <li>Click <span className="font-medium">+ Create new</span> and name it after the class (e.g. "CS 374")</li>
                    <li>Upload your syllabus, lecture slides, and readings as sources</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">Getting the URL:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Open the notebook</li>
                    <li>Copy the URL from your browser's address bar — it looks like <code className="text-xs bg-background px-1.5 py-0.5 rounded">notebooklm.google.com/notebook/...</code></li>
                    <li>Paste it below with the class name</li>
                  </ol>
                </div>
                <p className="text-xs">Add one per class. You can add more later from Settings.</p>
              </div>

              <div className="space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 animate-fade-up"
                  >
                    <div className="h-8 w-8 rounded-md bg-accent/30 flex items-center justify-center text-sm font-medium text-accent-foreground">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.notebookUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCourses(courses.filter((x) => x.id !== c.id))}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cname" className="text-xs">Class name</Label>
                    <Input
                      id="cname"
                      placeholder="CS 374"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="curl" className="text-xs">NotebookLM URL</Label>
                    <Input
                      id="curl"
                      placeholder="https://notebooklm.google.com/notebook/..."
                      value={draftUrl}
                      onChange={(e) => setDraftUrl(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addCourse}
                  disabled={!draftName.trim() || !draftUrl.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add class
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={next}
              size="lg"
              className="gap-1.5"
              disabled={step === 0 && !displayName.trim()}
            >
              {step === steps.length - 1 ? "Enter the Command Center" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Header({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="space-y-3">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
