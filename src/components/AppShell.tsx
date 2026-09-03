import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tools/email", label: "Smart Email" },
  { to: "/tools/meetings", label: "Meeting Summarizer" },
  { to: "/tools/planner", label: "AI Task Planner" },
  { to: "/history", label: "History" },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-obsidian text-frost">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 shrink-0 border-r border-line/70 bg-surface/80 backdrop-blur-sm transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Link to="/" className="flex items-center gap-3 px-5 py-4">
            <div className="lm-mark-glow grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet font-display text-[15px] font-bold text-obsidian">
              L
            </div>
            <div className="leading-tight">
              <p className="font-display text-[15px] font-semibold tracking-tight">LogiMate AI</p>
              <p className="text-[11px] text-muted-ink">Logistics productivity copilot</p>
            </div>
          </Link>
          <nav className="space-y-1 px-3 py-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-ink transition hover:bg-surface2 hover:text-frost"
                activeProps={{ className: "bg-surface2 text-frost border border-line" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mx-3 mt-4 rounded-xl border border-line bg-obsidian/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted-ink">
              LogiMate uses only what you type in. It never reads fleet, GPS, driver or shipment
              systems.
            </p>
          </div>
        </aside>

        {open && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-20 bg-obsidian/70 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line/70 bg-obsidian/80 px-5 py-4 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="rounded-lg border border-line bg-surface p-2 text-muted-ink lg:hidden"
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
              >
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-[15px] font-semibold tracking-tight">
                  {title}
                </h1>
                {subtitle && <p className="truncate text-[11px] text-muted-ink">{subtitle}</p>}
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted-ink sm:flex">
              <span className="size-1.5 rounded-full bg-mint" />
              Copilot ready
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-5 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
