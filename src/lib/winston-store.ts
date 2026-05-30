import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { getMyConfig, updateMyConfig, type WinstonConfig, type CourseHub } from "./winston-store.functions";

export type { WinstonConfig, CourseHub };

const DEFAULT: WinstonConfig = {
  onboarded: false,
  displayName: "",
  canvasFeedUrl: "",
  googleConnected: false,
  notificationsEnabled: false,
  courses: [],
  companionId: "barnaby",
};

export const configQueryKey = ["winston-config"] as const;

export function useWinstonConfig() {
  const qc = useQueryClient();
  const fetchCfg = useServerFn(getMyConfig);
  const saveCfg = useServerFn(updateMyConfig);

  const query = useQuery({
    queryKey: configQueryKey,
    queryFn: () => fetchCfg(),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (patch: Partial<WinstonConfig>) => saveCfg({ data: patch }),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: configQueryKey });
      const prev = qc.getQueryData<WinstonConfig>(configQueryKey);
      if (prev) qc.setQueryData<WinstonConfig>(configQueryKey, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(configQueryKey, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(configQueryKey, data);
    },
  });

  const update = useCallback((patch: Partial<WinstonConfig>) => {
    mutation.mutate(patch);
  }, [mutation]);

  return {
    cfg: query.data ?? DEFAULT,
    update,
    ready: query.isSuccess,
    loading: query.isLoading,
    error: query.error,
  };
}

// Simulated Canvas-feed assignments (since we can't actually fetch ICS in browser reliably)
export type Assignment = {
  id: string;
  title: string;
  courseCode: string;
  dueAt: Date;
};

export function getSimulatedAssignments(courses: CourseHub[]): Assignment[] {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const samples = [
    { offset: 1, title: "Problem Set 4", code: 0 },
    { offset: 2, title: "Reading Response", code: 1 },
    { offset: 5, title: "Midterm Study Guide", code: 0 },
    { offset: 8, title: "Lab Report 3", code: 2 },
    { offset: 12, title: "Essay Draft", code: 1 },
    { offset: 16, title: "Group Project Proposal", code: 2 },
  ];
  return samples
    .map((s, i) => {
      const course = courses[s.code % Math.max(courses.length, 1)];
      return {
        id: `a-${i}`,
        title: s.title,
        courseCode: course?.name ?? "General",
        dueAt: new Date(now.getTime() + s.offset * day),
      };
    })
    .filter((_, i) => i < Math.max(courses.length * 2, 3));
}

export type AlertTier = "horizon" | "incoming" | "focus";

export function tierFor(dueAt: Date): AlertTier {
  const days = (dueAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
  if (days <= 2) return "focus";
  if (days <= 7) return "incoming";
  return "horizon";
}

export const GEMINI_PROMPT =
  "@Google Calendar, give me a hyper-focused overview of my schedule today and tell me the single most critical assignment I should start working on early so I stay ahead of deadlines.";
