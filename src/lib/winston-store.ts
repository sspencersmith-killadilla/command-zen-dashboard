import { useEffect, useState, useCallback } from "react";

export type CourseHub = { id: string; name: string; notebookUrl: string };

export type WinstonConfig = {
  onboarded: boolean;
  canvasFeedUrl: string;
  googleConnected: boolean;
  notificationsEnabled: boolean;
  courses: CourseHub[];
};

const KEY = "winston-config-v1";

const DEFAULT: WinstonConfig = {
  onboarded: false,
  canvasFeedUrl: "",
  googleConnected: false,
  notificationsEnabled: false,
  courses: [],
};

export function loadConfig(): WinstonConfig {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function saveConfig(cfg: WinstonConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent("winston-config-change"));
}

export function useWinstonConfig() {
  const [cfg, setCfg] = useState<WinstonConfig>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCfg(loadConfig());
    setReady(true);
    const handler = () => setCfg(loadConfig());
    window.addEventListener("winston-config-change", handler);
    return () => window.removeEventListener("winston-config-change", handler);
  }, []);

  const update = useCallback((patch: Partial<WinstonConfig>) => {
    setCfg((prev) => {
      const next = { ...prev, ...patch };
      saveConfig(next);
      return next;
    });
  }, []);

  return { cfg, update, ready };
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
