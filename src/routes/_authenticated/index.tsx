import { createFileRoute } from "@tanstack/react-router";
import { useWinstonConfig } from "@/lib/winston-store";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Command Center" },
      { name: "description", content: "A calm, single-hub command center for college. Canvas, NotebookLM, and Gemini — automated." },
    ],
  }),
  component: Index,
});

function Index() {
  const { cfg, update, ready, loading } = useWinstonConfig();
  if (loading || !ready) return <div className="min-h-screen bg-background" />;
  if (!cfg.onboarded) return <OnboardingWizard initial={cfg} onComplete={update} />;
  return <Dashboard />;
}
