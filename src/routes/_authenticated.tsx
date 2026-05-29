import { useEffect, useState } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "authed" | "anon">("checking");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) setState("anon");
      else setState("authed");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(session?.user ? "authed" : "anon");
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state === "anon") {
      navigate({ to: "/login", replace: true });
    }
  }, [state, navigate]);

  if (state !== "authed") {
    return <div className="min-h-screen bg-background" />;
  }
  return <Outlet />;
}
