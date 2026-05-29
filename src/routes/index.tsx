import { createFileRoute } from "@tanstack/react-router";
import { useWinstonConfig } from "@/lib/winston-store";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Winston's Command Center" },
      { name: "description", content: "A calm, single-hub dashboard built for an ADHD college student. Canvas, NotebookLM, and Gemini — automated." },
      { property: "og:title", content: "Winston's Command Center" },
      { property: "og:description", content: "A calm, single-hub dashboard built for an ADHD college student." },
    ],
  }),
  component: Index,
});

function Index() {
  const { cfg, update, ready } = useWinstonConfig();
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!cfg.onboarded) return <OnboardingWizard initial={cfg} onComplete={update} />;
  return <Dashboard />;
}
