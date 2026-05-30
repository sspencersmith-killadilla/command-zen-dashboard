import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import {
  THEMES,
  COMPANION_LIST,
  companionsByTheme,
  type ThemeId,
} from "@/lib/companions";
import { getThemePack } from "@/lib/gamification-themes";
import { ACHIEVEMENTS } from "@/lib/gamification";
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Calendar,
  MessageSquare,
  RefreshCw,
  Settings as SettingsIcon,
  Palette,
  Lock,
  BookOpen,
  CheckCircle2,
  Bell,
  Users,
  Zap,
  Map as MapIcon,
  
  CalendarClock,
  Timer,
  Crown,
} from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Field Manual — How it works" },
      {
        name: "description",
        content:
          "Complete how-to guide: themes, companions, daily quests, XP, trophies, Canvas sync, and settings.",
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-primary" />
            Field Manual
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section>
          <Badge variant="secondary" className="mb-3">
            The complete guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            How it works.
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
            A quiet study companion that watches your Canvas assignments,
            breaks the day into five small steps, and gives you a character
            to do it with. This is the whole map — every system, every
            theme, every face.
          </p>

          {/* Table of contents */}
          <nav className="mt-8 grid sm:grid-cols-2 gap-2 text-sm">
            {[
              ["#getting-started", "1. Getting started", Sparkles],
              ["#daily-loop", "2. The daily loop", Calendar],
              ["#xp-trophies", "3. XP, levels & trophies", Trophy],
              ["#themes", "4. Themes & how to switch", Palette],
              ["#companions", "5. Companions & how to switch", Users],
              ["#canvas", "6. Connecting Canvas", RefreshCw],
              ["#plan", "7. Study Planner", CalendarClock],
              ["#focus", "8. Focus timer", Timer],
              ["#chat", "9. Chatting with your companion", MessageSquare],
              ["#settings", "10. Settings explained", SettingsIcon],
              ["#bios", "11. Character biographies", BookOpen],
              ["#faq", "12. FAQ & troubleshooting", Bell],
            ].map(([href, label, Icon]) => {
              const I = Icon as typeof Sparkles;
              return (
                <a
                  key={href as string}
                  href={href as string}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 hover:bg-muted/50 transition-colors"
                >
                  <I className="h-4 w-4 text-primary shrink-0" />
                  <span>{label as string}</span>
                </a>
              );
            })}
          </nav>
        </section>

        {/* 1. Getting started */}
        <Section id="getting-started" icon={Sparkles} title="1. Getting started">
          <ol className="list-decimal list-outside ml-5 space-y-3">
            <li>
              <strong>Sign in.</strong> Use your email or Google account on
              the <em>Login</em> page. Your progress, theme, and companion
              follow your account.
            </li>
            <li>
              <strong>Pick a world.</strong> On first launch you'll choose a
              theme (Mythic, Sports, Cottage, Railways…). The whole interface
              re-skins around that world — including your daily quests.
            </li>
            <li>
              <strong>Pick a companion.</strong> Each theme starts you with
              one Lv 1 starter. As you level up, four more companions in that
              theme unlock and you can swap freely.
            </li>
            <li>
              <strong>Connect Canvas.</strong> Paste your Canvas access token
              once in <em>Settings</em>. The app will pull your upcoming
              assignments and auto-clear ones you've submitted. (See section 6
              for step-by-step token instructions.)
            </li>
            <li>
              <strong>Run today's five steps.</strong> Open your dashboard.
              Five themed quests appear in the Gamification panel. Finishing
              them naturally during your study session earns XP and ticks the
              day's arc complete.
            </li>
          </ol>
        </Section>

        {/* 2. Daily loop */}
        <Section id="daily-loop" icon={Calendar} title="2. The daily loop">
          <p>
            Every day you get a five-step arc themed to your world. The{" "}
            <strong>steps complete themselves</strong> as you actually
            study — no self-reporting.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <LoopRow
              icon={Calendar}
              label="Step 1 · Scout the timeline"
              body="Earned the moment you check upcoming assignments on the dashboard."
            />
            <LoopRow
              icon={BookOpen}
              label="Step 2 · Open a notebook"
              body="Earned when you click into any Canvas course/notebook link."
            />
            <LoopRow
              icon={RefreshCw}
              label="Step 3 · Daily Reset"
              body="Earned when you copy the daily focus prompt for your other tools."
            />
            <LoopRow
              icon={MessageSquare}
              label="Step 4 · Talk to your companion"
              body="Earned the first time you chat with your companion that day."
            />
            <LoopRow
              icon={CheckCircle2}
              label="Step 5 · Clear an assignment"
              body="Auto-completes the moment Canvas marks an assignment submitted."
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Tip: complete all five and the day's narrative arc seals — your
            companion narrates the outcome themed to your world (e.g.{" "}
            <em>"The rite is complete"</em> in Mythic, <em>"Last stop reached"</em>{" "}
            in Railways, <em>"Page complete"</em> in Trading Cards).
          </p>
        </Section>

        {/* 3. XP / Trophies */}
        <Section id="xp-trophies" icon={Trophy} title="3. XP, levels & trophies">
          <p>
            Each quest awards XP (10–40). XP rolls into eight ranks per theme.
            Streaks are tracked separately — a missed day breaks the streak,
            but your XP and trophies are permanent.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Eight ranks per theme
              </div>
              <p className="text-sm">
                The titles change by world. In Mythic you climb from{" "}
                <em>Acolyte → Mythbearer</em>; in Railways from{" "}
                <em>Apprentice → Rail Legend</em>; in Trading Cards from{" "}
                <em>Newcomer → Hall-of-Fame</em>. XP thresholds are the same
                everywhere: 0, 80, 200, 450, 800, 1,300, 2,000, 3,000.
              </p>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Eight trophies, themed names
              </div>
              <ul className="text-sm space-y-1">
                {ACHIEVEMENTS.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <Trophy className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>{a.name}</strong>{" "}
                      <span className="text-muted-foreground">— {a.hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* 4. Themes */}
        <Section id="themes" icon={Palette} title="4. Themes & how to switch">
          <p>
            There are <strong>{THEMES.length} themes</strong>. Each comes with
            its own daily arc, ranks, trophy names, and 5 companions.
          </p>
          <Card className="p-4 mt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              How to switch theme
            </div>
            <ol className="list-decimal list-outside ml-5 text-sm space-y-1.5">
              <li>On the dashboard, open the <strong>Palette</strong> menu in the header.</li>
              <li>Pick any world from the list.</li>
              <li>Confirm the switch in the dialog — themes are a bigger commitment than companions, so we double-check.</li>
              <li>The interface re-skins immediately. Your XP, streak, and trophies carry over; quest <em>labels</em> change to match the new world.</li>
            </ol>
          </Card>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {THEMES.map((t) => {
              const pack = getThemePack(t.id);
              return (
                <Card key={t.id} className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{t.label}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {pack.hudLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t.blurb}</p>
                  <p className="text-xs mt-3">
                    <strong>Daily arc:</strong> {pack.arcTitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pack.arcSubtitle}
                  </p>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* 5. Companions */}
        <Section id="companions" icon={Users} title="5. Companions & how to switch">
          <p>
            Each theme has 5 companions, one per archetype:{" "}
            <strong>Sage</strong> (rigorous mentor),{" "}
            <strong>Chill</strong> (calm, dry, short replies),{" "}
            <strong>Hype</strong> (momentum, tiny next steps),{" "}
            <strong>Guardian</strong> (warm, protective triage), and{" "}
            <strong>Trickster</strong> (tough love, dry roast). They all share
            the same skills — only the voice changes.
          </p>
          <Card className="p-4 mt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              How to switch companion
            </div>
            <ol className="list-decimal list-outside ml-5 text-sm space-y-1.5">
              <li>Open the <strong>companion picker</strong> in the dashboard header (your current companion's portrait).</li>
              <li>Only companions in your current theme are listed — unlocked ones are tappable, locked ones show the level they unlock at.</li>
              <li>Tap any unlocked companion to swap instantly. No confirmation — switching voices is meant to be easy.</li>
              <li>To meet companions in a different world, switch theme first (section 4).</li>
            </ol>
          </Card>
        </Section>

        {/* 6. Canvas */}
        <Section id="canvas" icon={RefreshCw} title="6. Connecting Canvas">
          <p>
            Canvas connection is the engine behind the assignment list and
            auto-completing quests. It's a one-time setup.
          </p>
          <Card className="p-4 mt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Get your Canvas access token
            </div>
            <ol className="list-decimal list-outside ml-5 text-sm space-y-1.5">
              <li>Sign in to your Canvas at your school's URL (e.g. <code className="text-xs">school.instructure.com</code>).</li>
              <li>Click <strong>Account</strong> in the left sidebar, then <strong>Settings</strong>.</li>
              <li>Scroll to <strong>Approved Integrations</strong> and click <strong>+ New Access Token</strong>.</li>
              <li>Purpose: <em>"Study companion"</em>. Leave the expiry blank (or set one if you prefer).</li>
              <li>Click <strong>Generate Token</strong>. <strong>Copy the long token immediately</strong> — Canvas won't show it again.</li>
            </ol>
          </Card>
          <Card className="p-4 mt-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Paste it in
            </div>
            <ol className="list-decimal list-outside ml-5 text-sm space-y-1.5">
              <li>Open <Link to="/settings" className="underline">Settings</Link>.</li>
              <li>In the <strong>Canvas</strong> section, paste your Canvas domain (just the host, e.g. <code className="text-xs">school.instructure.com</code>) and the token you copied.</li>
              <li>Click <strong>Save</strong>. The token is validated and upcoming assignments start pulling in.</li>
              <li>To rotate or revoke it later, regenerate the token in Canvas and paste the new value.</li>
            </ol>
          </Card>
        </Section>

        {/* 7. Plan */}
        <Section id="plan" icon={CalendarClock} title="7. Study Planner">
          <p>
            The <Link to="/plan" className="underline">Planner</Link> turns
            your Canvas backlog into a concrete week. Open it from the{" "}
            <strong>Plan</strong> link in the dashboard header.
          </p>
          <ul className="list-disc list-outside ml-5 space-y-2 mt-3">
            <li><strong>Auto-generate.</strong> Hit <em>Auto-plan</em> and your upcoming Canvas assignments slot into study blocks weighted by due date.</li>
            <li><strong>Add a block manually.</strong> Title, optional notes, date — useful for review sessions or non-Canvas work.</li>
            <li><strong>Tick blocks done</strong> as you finish them; completed blocks fall out of the active list and feed your streak.</li>
            <li><strong>Delete</strong> anything that no longer fits — the plan is meant to be edited daily.</li>
          </ul>
        </Section>

        {/* 8. Focus */}
        <Section id="focus" icon={Timer} title="8. Focus timer">
          <p>
            The <Link to="/focus" className="underline">Focus</Link> page is a
            distraction-free Pomodoro-style timer. Use it for any single block
            of deep work.
          </p>
          <ul className="list-disc list-outside ml-5 space-y-2 mt-3">
            <li><strong>Set minutes</strong> (default 25) and optionally tag the session with an assignment or topic.</li>
            <li><strong>Press Start.</strong> The clock counts down; closing the tab is fine, the session keeps running server-side.</li>
            <li><strong>Press Stop</strong> when you're done. Completed minutes are logged and shown in your recent sessions list.</li>
            <li>Launching Focus from an assignment link on the dashboard pre-fills the tag for you.</li>
          </ul>
        </Section>

        {/* 9. Chat */}
        <Section id="chat" icon={MessageSquare} title="9. Chatting with your companion">
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>The chat panel lives on the right of the dashboard. Type anything — "what should I do first?", "I'm overwhelmed", "explain this prompt."</li>
            <li>Your companion knows your current assignments and your selected theme, and answers in their personal voice (rigorous, chill, hyped, protective, or roast — see section 5).</li>
            <li>Chatting at least once a day completes step 4 of the daily arc automatically.</li>
            <li>Conversations are short and tactical by design. If you want a long explanation, just ask: <em>"go deep"</em>.</li>
          </ul>
        </Section>

        {/* 10. Settings */}
        <Section id="settings" icon={SettingsIcon} title="10. Settings explained">
          <p>
            Open <Link to="/settings" className="underline">Settings</Link>{" "}
            from the dashboard header. Each change has a <strong>Save</strong>{" "}
            button — no need to re-do onboarding to update anything.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <SettingRow label="Display name" body="What your companion calls you." />
            <SettingRow label="Theme" body="The world you're in. Same as the Palette menu on the dashboard, with a confirmation prompt." />
            <SettingRow label="Companion" body="Your active companion. Same as the dashboard portrait dropdown." />
            <SettingRow label="Canvas domain & token" body="Connection to your school's Canvas. Stored encrypted server-side." />
            <SettingRow label="Google Calendar" body="Optional. Lets the planner see your class times so its planning is realistic." />
            <SettingRow label="Reset progress" body="Wipes XP, streaks, trophies, and quest history. Theme & companion are kept." />
          </div>
        </Section>


        {/* 11. Bios */}
        <section id="bios" className="scroll-mt-20">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              11. Character biographies
            </h2>
          </div>
          <p className="text-muted-foreground mb-8">
            All {COMPANION_LIST.length} companions, grouped by world. Each
            line tells you their archetype, unlock level, and the voice
            they'll use with you.
          </p>

          <div className="space-y-12">
            {THEMES.map((theme) => {
              const roster = companionsByTheme(theme.id as ThemeId);
              const pack = getThemePack(theme.id as ThemeId);
              return (
                <div key={theme.id} className="scroll-mt-20">
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary">
                      {pack.hudLabel}
                    </div>
                    <h3 className="text-xl font-semibold mt-0.5">
                      {theme.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{theme.blurb}</p>
                  </div>
                  <Separator className="mb-4" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    {roster.map((c) => (
                      <Card key={c.id} className="p-4 flex gap-4">
                        <div className="shrink-0">
                          <CompanionAvatar companionId={c.id} size="md" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="font-semibold truncate">{c.name}</h4>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1 shrink-0">
                              {c.unlockLevel > 1 && <Lock className="h-3 w-3" />}
                              Lv {c.unlockLevel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {c.species}
                          </p>
                          <p className="text-sm mt-1.5">{c.tagline}</p>
                          <p className="text-[11px] text-muted-foreground mt-2 line-clamp-3">
                            {personaSummary(c.persona)}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 12. FAQ */}
        <Section id="faq" icon={Bell} title="12. FAQ & troubleshooting">
          <FaqRow
            q="My assignments aren't showing up."
            a="Open Settings and re-save your Canvas domain and token. The domain should be just the host (school.instructure.com), no https:// and no path."
          />
          <FaqRow
            q="A quest didn't auto-complete."
            a="Quests fire on real actions: viewing the timeline, opening a notebook, copying the Daily Reset, chatting once, and Canvas marking an assignment submitted. If Canvas hasn't updated yet, the assignment-clear step will trigger on the next sync."
          />
          <FaqRow
            q="Does the Focus timer keep running if I close the tab?"
            a="Yes. The session is tracked server-side from Start to Stop, so closing the tab or switching devices is fine — just come back and press Stop when you're done."
          />
          <FaqRow
            q="Auto-plan didn't pick up an assignment."
            a="Auto-plan only sees what Canvas exposes. If something's missing, re-sync from Settings, then run Auto-plan again — or add the block manually on the Planner."
          />
          <FaqRow
            q="I want to start over."
            a="Settings → Reset progress wipes XP, streaks, trophies, and quest history but keeps your theme and companion. To change the world, use the Palette menu (you'll be asked to confirm)."
          />
          <FaqRow
            q="A companion is locked."
            a="Reach the listed level. Each theme's roster unlocks at Lv 1, 2, 3, 4, and 5 — so finishing the first daily arc usually unlocks the second companion."
          />
          <FaqRow
            q="Can I switch back to my old theme?"
            a="Yes. Switching is reversible and your XP and trophies are preserved. The Palette menu lists every world."
          />
        </Section>


        <p className="text-center text-xs text-muted-foreground pt-8">
          That's the whole manual. Go finish today's arc.
        </p>
      </main>
    </div>
  );
}

/* ---------- small presentational helpers ---------- */

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof Sparkles;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="prose prose-sm max-w-none text-foreground [&_p]:text-base [&_p]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function LoopRow({
  icon: Icon,
  label,
  body,
}: {
  icon: typeof Sparkles;
  label: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md border border-border/60">
      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="p-3 rounded-md border border-border/60">
      <div className="text-sm font-medium">{label}</div>
      <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="py-3 border-b border-border/60 last:border-b-0">
      <p className="font-medium text-sm">{q}</p>
      <p className="text-sm text-muted-foreground mt-1">{a}</p>
    </div>
  );
}

/** Pull just the human-readable first sentence out of a persona system prompt. */
function personaSummary(persona: string): string {
  // Persona strings start with "You are NAME, SPECIES. FLAVOR. ARCHETYPE_DESCRIPTION."
  // Grab everything between the first period and the first ALL-CAPS section label (VOICE:/BEHAVIOR:).
  const stop = persona.search(/\b(VOICE|BEHAVIOR):/);
  const head = stop > 0 ? persona.slice(0, stop) : persona;
  // Drop the leading "You are X, Y." preamble.
  const cleaned = head.replace(/^You are [^.]+\.\s*/, "").trim();
  return cleaned.replace(/\s+/g, " ");
}
