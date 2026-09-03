import { useEffect, useState, type ReactNode } from "react";
import { Copy, Check, RefreshCw, Pencil, Download, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

export const DISCLAIMER =
  "AI-generated information may contain errors. Always review and verify important information before using it in professional communications or operational decisions.";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-line bg-surface/60 px-4 py-3 ${className}`}
    >
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-amber/40 bg-amber/10 text-amber">
        <TriangleAlert className="size-3.5" />
      </span>
      <p className="text-xs leading-relaxed text-muted-ink">
        <span className="font-semibold text-frost">Responsible AI. </span>
        {DISCLAIMER}
      </p>
    </div>
  );
}

export function Panel({
  title,
  badge,
  glow,
  children,
  actions,
}: {
  title: string;
  badge?: string;
  glow?: boolean;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className={`${glow ? "lm-glow" : "lm-spec"} rounded-2xl p-5`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-sm font-semibold text-frost">{title}</p>
        {badge && (
          <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan uppercase">
            {badge}
          </span>
        )}
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}

const controlBase =
  "w-full rounded-lg border border-line bg-obsidian/50 px-3 py-2 text-sm text-frost placeholder:text-muted-ink/70 focus:border-cyan/60 focus:outline-none";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlBase} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlBase} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlBase} ${props.className ?? ""}`} />;
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`lm-cta-glow rounded-xl bg-cyan px-4 py-2.5 font-display text-sm font-semibold text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-frost/80 transition hover:bg-surface2 disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function OutputActions({
  text,
  onRegenerate,
  onEdit,
  editing,
  exportName,
  extra,
}: {
  text: string;
  onRegenerate?: () => void;
  onEdit?: () => void;
  editing?: boolean;
  exportName?: string;
  extra?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed — select the text manually");
    }
  };

  const exportTxt = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName ?? "logimate"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <GhostButton onClick={copy}>
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </GhostButton>
      {onEdit && (
        <GhostButton onClick={onEdit}>
          <Pencil className="size-3.5" />
          {editing ? "Done editing" : "Edit"}
        </GhostButton>
      )}
      {onRegenerate && (
        <GhostButton onClick={onRegenerate}>
          <RefreshCw className="size-3.5" />
          Regenerate
        </GhostButton>
      )}
      {exportName && (
        <GhostButton onClick={exportTxt}>
          <Download className="size-3.5" />
          Export
        </GhostButton>
      )}
      {extra}
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-2.5" aria-live="polite" aria-busy="true">
      <div className="h-3 w-2/3 animate-pulse rounded bg-surface2" />
      <div className="h-3 w-full animate-pulse rounded bg-surface2" />
      <div className="h-3 w-11/12 animate-pulse rounded bg-surface2" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-surface2" />
      <p className="pt-2 text-xs text-muted-ink">LogiMate is drafting…</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
      <p className="text-xs leading-relaxed text-frost">{message}</p>
      {onRetry && (
        <div className="mt-3">
          <GhostButton onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Try again
          </GhostButton>
        </div>
      )}
    </div>
  );
}

export function MissingInfo({ items, label = "Missing information" }: { items: string[]; label?: string }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-lg border border-amber/25 bg-amber/5 p-3">
      <p className="text-[11px] tracking-wider text-amber uppercase">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs text-muted-ink">
            <span className="text-amber">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "border-destructive/40 bg-destructive/10 text-destructive",
  High: "border-amber/40 bg-amber/10 text-amber",
  Medium: "border-cyan/40 bg-cyan/10 text-cyan",
  Low: "border-mint/40 bg-mint/10 text-mint",
};

export function PriorityChip({ priority }: { priority: string }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
        PRIORITY_STYLES[priority] ?? "border-line bg-surface2 text-muted-ink"
      }`}
    >
      {priority}
    </span>
  );
}
