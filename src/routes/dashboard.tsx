import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/ai-ui";
import { AppShell } from "@/components/AppShell";
import { metricsFrom, readHistory, type HistoryEntry } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LogiMate AI" },
      {
        name: "description",
        content:
          "Your logistics copilot dashboard: quick access to the email generator, meeting summarizer and task planner, plus estimated time saved.",
      },
      { property: "og:title", content: "Dashboard — LogiMate AI" },
      {
        property: "og:description",
        content: "Quick access to LogiMate's three AI tools and your productivity metrics.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(readHistory());
    sync();
    window.addEventListener("logimate:history", sync);
    return () => window.removeEventListener("logimate:history", sync);
  }, []);

  const m = metricsFrom(entries);

  return (
    <AppShell title="Dashboard" subtitle="Your logistics copilot at a glance">
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Tasks planned" value={String(m.tasksPlanned)} note={`${m.plans} plans run`} />
        <Metric label="Emails generated" value={String(m.emails)} note="all time" />
        <Metric label="Meetings summarised" value={String(m.meetings)} note="all time" />
        <Metric
          label="Time saved · estimated"
          value={`${m.hoursSaved}h`}
          note="based on your usage"
          accent
        />
      </section>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
            The tools
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Three surfaces, one copilot
          </h2>
        </div>
      </div>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        <ToolCard
          to="/tools/email"
          title="Smart Email Generator"
          badge="Tool 01"
          tone="text-cyan bg-cyan/15"
          glow
          body="Draft logistics emails from the details you give — never inventing shipment numbers, dates or commitments."
          cta="Draft an email"
        />
        <ToolCard
          to="/tools/meetings"
          title="Meeting Summarizer"
          badge="Tool 02"
          tone="text-violet bg-violet/15"
          body="Turn a transcript into decisions, action items and deadlines, then push the actions straight into the planner."
          cta="Summarise a meeting"
        />
        <ToolCard
          to="/tools/planner"
          title="AI Task Planner"
          badge="Tool 03"
          tone="text-mint bg-mint/15"
          body="Build a realistic daily schedule from urgency, impact and dependencies — no hidden access to fleet or GPS data."
          cta="Plan my day"
        />
      </section>

      <section className="mt-6 lm-spec rounded-2xl p-5">
        <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted-ink uppercase">
          Recent activity
        </p>
        {entries.length === 0 ? (
          <p className="mt-3 text-xs text-muted-ink">
            Nothing yet. Run any tool and it will appear here and in your history.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.slice(0, 5).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-obsidian/40 px-3 py-2"
              >
                <span className="truncate text-xs text-frost">{e.title}</span>
                <span className="shrink-0 text-[11px] text-muted-ink">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <Link to="/history" className="text-xs text-muted-ink transition hover:text-frost">
            View all history →
          </Link>
        </div>
      </section>

      <div className="mt-8 pb-6">
        <Disclaimer />
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div className="lm-spec rounded-2xl p-5">
      <p className="text-xs text-muted-ink">{label}</p>
      <p
        className={`mt-2 font-display text-3xl font-bold tracking-tight ${accent ? "text-cyan" : "text-frost"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-ink">{note}</p>
    </div>
  );
}

function ToolCard({
  to,
  title,
  badge,
  tone,
  body,
  cta,
  glow,
}: {
  to: "/tools/email" | "/tools/meetings" | "/tools/planner";
  title: string;
  badge: string;
  tone: string;
  body: string;
  cta: string;
  glow?: boolean;
}) {
  return (
    <div className={`${glow ? "lm-glow" : "lm-spec"} rounded-2xl p-5`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-frost">{title}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${tone}`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-ink">{body}</p>
      <div className="mt-4">
        <Link
          to={to}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-frost/90 transition hover:bg-surface2"
        >
          {cta} →
        </Link>
      </div>
    </div>
  );
}
