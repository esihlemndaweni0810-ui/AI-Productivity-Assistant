import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Disclaimer, GhostButton, Panel } from "@/components/ai-ui";
import { deleteHistoryEntry, readHistory, type HistoryEntry } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — LogiMate AI" },
      {
        name: "description",
        content:
          "Every email draft, meeting summary and daily plan LogiMate generated for you, stored on your device.",
      },
      { property: "og:title", content: "History — LogiMate AI" },
      {
        property: "og:description",
        content: "Review and re-use your previous LogiMate outputs.",
      },
    ],
  }),
  component: History,
});

const LABELS = { email: "Smart Email", meeting: "Meeting Summary", planner: "Task Plan" } as const;

function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setEntries(readHistory());
    sync();
    window.addEventListener("logimate:history", sync);
    return () => window.removeEventListener("logimate:history", sync);
  }, []);

  return (
    <AppShell title="History" subtitle="Stored locally on this device">
      <div className="space-y-5">
        <Panel title="Generated outputs" badge={`${entries.length} items`}>
          {entries.length === 0 ? (
            <p className="text-xs text-muted-ink">
              No outputs yet. Anything you generate in the three tools is saved here.
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-line bg-obsidian/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-frost">{entry.title}</p>
                      <p className="text-[11px] text-muted-ink">
                        {LABELS[entry.kind]} · {new Date(entry.createdAt).toLocaleString()} · ~
                        {entry.minutesSaved} min saved
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <GhostButton
                        onClick={() => setOpenId(openId === entry.id ? null : entry.id)}
                      >
                        {openId === entry.id ? "Hide" : "View"}
                      </GhostButton>
                      <button
                        aria-label="Delete entry"
                        className="text-muted-ink transition hover:text-destructive"
                        onClick={() => deleteHistoryEntry(entry.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  {openId === entry.id && (
                    <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-line bg-obsidian/60 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-muted-ink">
                      {JSON.stringify(entry.output, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Disclaimer />
      </div>
    </AppShell>
  );
}
