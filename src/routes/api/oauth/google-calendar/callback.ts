import { createFileRoute } from "@tanstack/react-router";
import {
  buildRedirectUri,
  exchangeCode,
  persistTokens,
  verifyState,
} from "@/lib/google-calendar.server";

export const Route = createFileRoute("/api/oauth/google-calendar/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        const back = (params: Record<string, string>) => {
          const dest = new URL("/settings", url.origin);
          for (const [k, v] of Object.entries(params)) dest.searchParams.set(k, v);
          return Response.redirect(dest.toString(), 302);
        };

        if (errorParam) return back({ gcal: "error", reason: errorParam });
        if (!code || !state) return back({ gcal: "error", reason: "missing_params" });

        try {
          const { uid } = verifyState(state);
          const tokens = await exchangeCode({
            code,
            redirectUri: buildRedirectUri(url.origin),
          });
          await persistTokens(uid, tokens);
          return back({ gcal: "connected" });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "unknown_error";
          console.error("Google Calendar OAuth callback failed:", msg);
          return back({ gcal: "error", reason: msg.slice(0, 200) });
        }
      },
    },
  },
});
