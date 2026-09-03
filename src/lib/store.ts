export type HistoryKind = "email" | "meeting" | "planner";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  title: string;
  createdAt: string;
  minutesSaved: number;
  input: unknown;
  output: unknown;
};

const HISTORY_KEY = "logimate.history";
const HANDOFF_KEY = "logimate.handoff";

const MINUTES_SAVED: Record<HistoryKind, number> = {
  email: 8,
  meeting: 25,
  planner: 15,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function readHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: Omit<HistoryEntry, "id" | "createdAt" | "minutesSaved">) {
  if (!isBrowser()) return;
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    minutesSaved: MINUTES_SAVED[entry.kind],
  };
  const next = [full, ...readHistory()].slice(0, 100);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("logimate:history"));
  return full;
}

export function deleteHistoryEntry(id: string) {
  if (!isBrowser()) return;
  const next = readHistory().filter((e) => e.id !== id);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("logimate:history"));
}

export function metricsFrom(entries: HistoryEntry[]) {
  const count = (kind: HistoryKind) => entries.filter((e) => e.kind === kind).length;
  const tasksPlanned = entries
    .filter((e) => e.kind === "planner")
    .reduce((sum, e) => {
      const out = e.output as { schedule?: unknown[] } | null;
      return sum + (out?.schedule?.length ?? 0);
    }, 0);
  const minutes = entries.reduce((sum, e) => sum + (e.minutesSaved ?? 0), 0);
  return {
    emails: count("email"),
    meetings: count("meeting"),
    plans: count("planner"),
    tasksPlanned,
    hoursSaved: Math.round((minutes / 60) * 10) / 10,
  };
}

/* Cross-tool handoff: meeting action items -> planner, task/issue -> email */
export type Handoff =
  | {
      target: "planner";
      tasks: { name: string; deadline: string; priority: string; duration: string; dependency: string }[];
      source: string;
    }
  | { target: "email"; purpose: string; details: string; source: string };

export function setHandoff(handoff: Handoff) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
}

export function takeHandoff<T extends Handoff["target"]>(
  target: T,
): Extract<Handoff, { target: T }> | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Handoff;
    if (parsed.target !== target) return null;
    window.sessionStorage.removeItem(HANDOFF_KEY);
    return parsed as Extract<Handoff, { target: T }>;
  } catch {
    return null;
  }
}
