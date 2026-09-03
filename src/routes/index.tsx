import { createFileRoute, Link } from "@tanstack/react-router";
import { Disclaimer } from "@/components/ai-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LogiMate AI — AI productivity copilot for logistics teams" },
      {
        name: "description",
        content:
          "Draft logistics emails, summarise operational meetings and plan your day — one AI assistant that never invents shipment data.",
      },
      { property: "og:title", content: "LogiMate AI — AI copilot for logistics teams" },
      {
        property: "og:description",
        content:
          "Draft logistics emails, summarise operational meetings and plan your day in one integrated AI assistant.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-obsidian text-frost">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/70 bg-obsidian/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="lm-mark-glow grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet font-display text-[15px] font-bold text-obsidian">
            L
          </div>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold tracking-tight">LogiMate AI</p>
            <p className="text-[11px] text-muted-ink">Logistics productivity copilot</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted-ink sm:flex">
          <span className="size-1.5 rounded-full bg-mint" />
          Copilot ready
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] tracking-[0.18em] text-cyan uppercase">
              <span className="size-1.5 rounded-full bg-cyan" />
              AI copilot · v1
            </div>
            <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
              Cut through the admin.
              <br className="hidden sm:block" />
              <span className="text-cyan"> Ship the work.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-ink">
              LogiMate is one integrated assistant for logistics teams — draft client and driver
              emails, turn meeting notes into action items, and build a realistic daily schedule.
              Every output is flagged for human review, never invented.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="lm-cta-glow rounded-xl bg-cyan px-5 py-2.5 font-display text-sm font-semibold text-obsidian transition hover:brightness-110"
              >
                Open the dashboard
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-[12px] text-muted-ink">
              <span className="rounded-full border border-line bg-surface px-3 py-1">
                Smart Email Generator
              </span>
              <span className="rounded-full border border-line bg-surface px-3 py-1">
                Meeting Summarizer
              </span>
              <span className="rounded-full border border-line bg-surface px-3 py-1">
                AI Task Planner
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lm-spec h-full rounded-2xl p-6">
              <p className="font-display text-xs font-semibold tracking-[0.18em] text-muted-ink uppercase">
                One connected workflow
              </p>
              <div className="mt-5 space-y-4">
                <Step n="1" color="text-cyan" title="Summarise the briefing">
                  Meeting notes become decisions &amp; action items.
                </Step>
                <div className="ml-4 h-3 border-l border-dashed border-line/80" />
                <Step n="2" color="text-violet" title="Plan the day">
                  Action items feed a prioritised schedule.
                </Step>
                <div className="ml-4 h-3 border-l border-dashed border-line/80" />
                <Step n="3" color="text-cyan" title="Draft the messages" highlight>
                  Escalations and customer emails, ready to send.
                </Step>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-14 flex items-end justify-between">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-cyan uppercase">
              The tools
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Three surfaces, one copilot
            </h2>
          </div>
          <Link
            to="/dashboard"
            className="hidden text-sm text-muted-ink transition hover:text-frost sm:inline"
          >
            Open all tools →
          </Link>
        </div>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="lm-glow rounded-2xl p-5">
            <ToolHead title="Smart Email Generator" badge="Tool 01" tone="text-cyan bg-cyan/15" />
            <p className="mt-2 text-xs leading-relaxed text-muted-ink">
              Draft logistics emails from the details you give — never inventing shipment numbers,
              dates or commitments.
            </p>
            <div className="mt-4 rounded-lg border border-cyan/25 bg-obsidian/50 p-3">
              <p className="font-display text-[13px] font-medium text-frost">
                Subject: Update on delayed delivery
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-ink">
                Every fact in the draft comes from what you typed. Anything absent is listed for you
                to fill in.
              </p>
              <p className="mt-2 text-[11px] text-amber">
                Assumption: no revised ETA provided — left for you to confirm.
              </p>
            </div>
            <div className="mt-4">
              <Link
                to="/tools/email"
                className="rounded-lg bg-cyan px-3 py-1.5 text-xs font-semibold text-obsidian transition hover:brightness-110"
              >
                Draft an email
              </Link>
            </div>
          </div>

          <div className="lm-spec rounded-2xl p-5">
            <ToolHead title="Meeting Summarizer" badge="Tool 02" tone="text-violet bg-violet/15" />
            <p className="mt-2 text-xs leading-relaxed text-muted-ink">
              Turn a transcript into decisions, action items and deadlines. Gaps show “Not
              specified” — never filled in.
            </p>
            <div className="mt-4 rounded-lg border border-violet/25 bg-obsidian/50 p-3">
              <p className="text-[11px] tracking-wider text-violet uppercase">Action items</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-ink">Confirm carrier slot</span>
                <span className="text-frost/80">Owner from your notes</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-ink">Update dock schedule</span>
                <span className="text-amber">Not specified</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/tools/meetings"
                className="rounded-lg bg-violet px-3 py-1.5 text-xs font-semibold text-obsidian transition hover:brightness-110"
              >
                Summarise a meeting
              </Link>
            </div>
          </div>

          <div className="lm-spec rounded-2xl p-5">
            <ToolHead title="AI Task Planner" badge="Tool 03" tone="text-mint bg-mint/15" />
            <p className="mt-2 text-xs leading-relaxed text-muted-ink">
              Build a realistic daily schedule from urgency, impact and dependencies — no hidden
              access to fleet or GPS data.
            </p>
            <div className="mt-4 space-y-2">
              <PlanRow dot="bg-amber" title="Critical work first" meta="Deadline-driven · Critical" />
              <PlanRow dot="bg-cyan" title="High-impact follow-ups" meta="Dependencies · High" />
              <PlanRow dot="bg-mint" title="Routine admin" meta="Fills the gaps · Medium" />
            </div>
            <div className="mt-4">
              <Link
                to="/tools/planner"
                className="rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-obsidian transition hover:brightness-110"
              >
                Plan my day
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8 pb-10">
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}

function Step({
  n,
  color,
  title,
  highlight,
  children,
}: {
  n: string;
  color: string;
  title: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`grid size-8 shrink-0 place-items-center rounded-lg font-display text-xs font-semibold ${color} ${
          highlight ? "border border-cyan/40 bg-cyan/10" : "border border-line bg-surface2"
        }`}
      >
        {n}
      </div>
      <div>
        <p className="text-sm font-medium text-frost">{title}</p>
        <p className="text-xs text-muted-ink">{children}</p>
      </div>
    </div>
  );
}

function ToolHead({ title, badge, tone }: { title: string; badge: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-display text-sm font-semibold text-frost">{title}</p>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${tone}`}
      >
        {badge}
      </span>
    </div>
  );
}

function PlanRow({ dot, title, meta }: { dot: string; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-obsidian/40 px-3 py-2">
      <span className={`size-2 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-frost">{title}</p>
        <p className="text-[11px] text-muted-ink">{meta}</p>
      </div>
    </div>
  );
}
