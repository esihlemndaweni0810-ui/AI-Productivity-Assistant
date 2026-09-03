import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Disclaimer,
  ErrorState,
  Field,
  GhostButton,
  MissingInfo,
  OutputActions,
  Panel,
  PriorityChip,
  PrimaryButton,
  Skeleton,
  TextArea,
  TextInput,
} from "@/components/ai-ui";
import {
  meetingInputSchema,
  summarizeMeeting,
  type MeetingInput,
  type MeetingOutput,
} from "@/lib/ai.functions";
import { saveHistory, setHandoff } from "@/lib/store";

export const Route = createFileRoute("/tools/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — LogiMate AI" },
      {
        name: "description",
        content:
          "Summarise logistics meetings into key points, decisions, action items with owners and deadlines — gaps marked 'Not specified'.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — LogiMate AI" },
      {
        property: "og:description",
        content: "Turn operational briefings into decisions and action items you can plan against.",
      },
    ],
  }),
  component: MeetingTool,
});

const EMPTY: MeetingInput = { title: "", date: "", attendees: "", notes: "" };

function MeetingTool() {
  const navigate = useNavigate();
  const summarize = useServerFn(summarizeMeeting);
  const [form, setForm] = useState<MeetingInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MeetingOutput | null>(null);
  const [editing, setEditing] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: MeetingInput) => summarize({ data: input }),
    onSuccess: (output, input) => {
      setResult(output);
      setEditing(false);
      saveHistory({
        kind: "meeting",
        title: `Meeting · ${input.title}`,
        input,
        output,
      });
    },
  });

  const submit = () => {
    const parsed = meetingInputSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  };

  const asText = result
    ? [
        `Meeting: ${form.title}`,
        `Date: ${form.date}`,
        `Attendees: ${form.attendees}`,
        "",
        "SUMMARY",
        result.summary,
        "",
        "KEY POINTS",
        ...result.keyPoints.map((p) => `- ${p}`),
        "",
        "DECISIONS",
        ...result.decisions.map((d) => `- ${d}`),
        "",
        "ACTION ITEMS",
        ...result.actionItems.map(
          (a) => `- ${a.task} | Owner: ${a.owner} | Deadline: ${a.deadline} | ${a.priority}`,
        ),
        "",
        "FOLLOW-UPS",
        ...result.followUps.map((f) => `- ${f}`),
      ].join("\n")
    : "";

  const sendToPlanner = () => {
    if (!result) return;
    setHandoff({
      target: "planner",
      source: form.title,
      tasks: result.actionItems.map((a) => ({
        name: a.task,
        deadline: a.deadline === "Not specified" ? "" : a.deadline,
        priority: a.priority,
        duration: "",
        dependency: "",
      })),
    });
    navigate({ to: "/tools/planner" });
  };

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      subtitle="Notes → AI summary → your review → action items"
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Panel title="Meeting details" badge="Tool 02">
            <div className="space-y-4">
              <Field label="Meeting title" error={errors["title"]}>
                <TextInput
                  value={form.title}
                  placeholder="e.g. Weekly dispatch review"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date" error={errors["date"]}>
                  <TextInput
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </Field>
                <Field label="Attendees" error={errors["attendees"]}>
                  <TextInput
                    value={form.attendees}
                    placeholder="Names, comma separated"
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Meeting notes or transcript" error={errors["notes"]}>
                <TextArea
                  rows={10}
                  value={form.notes}
                  placeholder="Paste the raw notes. Owners and deadlines that are not in the text will be marked 'Not specified'."
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
              <PrimaryButton className="w-full" disabled={mutation.isPending} onClick={submit}>
                {mutation.isPending ? "Summarising…" : "Summarise meeting"}
              </PrimaryButton>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <Panel title="Summary output" glow badge="Human review">
            {mutation.isPending && <Skeleton />}
            {mutation.isError && !mutation.isPending && (
              <ErrorState
                message={
                  (mutation.error as Error)?.message ||
                  "The summary could not be generated. Please try again."
                }
                onRetry={submit}
              />
            )}
            {!mutation.isPending && !mutation.isError && !result && (
              <p className="text-xs text-muted-ink">
                Paste your notes to get a summary, decisions and action items you can push straight
                into the planner.
              </p>
            )}
            {result && !mutation.isPending && (
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] tracking-wider text-cyan uppercase">Summary</p>
                  {editing ? (
                    <TextArea
                      rows={5}
                      className="mt-2"
                      value={result.summary}
                      onChange={(e) => setResult({ ...result, summary: e.target.value })}
                    />
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-frost/90">{result.summary}</p>
                  )}
                </div>

                <ListBlock title="Key discussion points" items={result.keyPoints} tone="text-cyan" />
                <ListBlock title="Decisions made" items={result.decisions} tone="text-violet" />

                <div>
                  <p className="text-[11px] tracking-wider text-violet uppercase">Action items</p>
                  <div className="mt-2 space-y-2">
                    {result.actionItems.length === 0 && (
                      <p className="text-xs text-muted-ink">No action items identified.</p>
                    )}
                    {result.actionItems.map((a, i) => (
                      <div
                        key={`${a.task}-${i}`}
                        className="rounded-lg border border-line bg-obsidian/40 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-medium text-frost">{a.task}</p>
                          <PriorityChip priority={a.priority} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 text-[11px] text-muted-ink">
                          <span>
                            Owner:{" "}
                            <span className={a.owner === "Not specified" ? "text-amber" : "text-frost/80"}>
                              {a.owner}
                            </span>
                          </span>
                          <span>
                            Deadline:{" "}
                            <span
                              className={a.deadline === "Not specified" ? "text-amber" : "text-frost/80"}
                            >
                              {a.deadline}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ListBlock title="Follow-up items" items={result.followUps} tone="text-mint" />
                <MissingInfo items={result.missingInformation} />

                <OutputActions
                  text={asText}
                  editing={editing}
                  onEdit={() => setEditing((v) => !v)}
                  onRegenerate={submit}
                  exportName={`logimate-meeting-${form.title.toLowerCase().replace(/\s+/g, "-")}`}
                  extra={
                    <GhostButton onClick={sendToPlanner} disabled={result.actionItems.length === 0}>
                      Send action items to Planner →
                    </GhostButton>
                  }
                />
              </div>
            )}
          </Panel>
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}

function ListBlock({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className={`text-[11px] tracking-wider uppercase ${tone}`}>{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="flex gap-2 text-xs text-muted-ink">
            <span className={tone}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
