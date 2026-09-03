import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  Select,
  Skeleton,
  TextInput,
} from "@/components/ai-ui";
import {
  planTasks,
  plannerInputSchema,
  type PlannerInput,
  type PlannerOutput,
} from "@/lib/ai.functions";
import { saveHistory, setHandoff, takeHandoff } from "@/lib/store";

export const Route = createFileRoute("/tools/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — LogiMate AI" },
      {
        name: "description",
        content:
          "Turn your logistics task list into a prioritised daily schedule with deadline risks and time-saving suggestions.",
      },
      { property: "og:title", content: "AI Task Planner — LogiMate AI" },
      {
        property: "og:description",
        content: "Prioritise logistics tasks by urgency, impact, deadlines and dependencies.",
      },
    ],
  }),
  component: PlannerTool,
});

type Task = PlannerInput["tasks"][number];

const emptyTask = (): Task => ({
  name: "",
  deadline: "",
  priority: "Unspecified",
  duration: "",
  dependency: "",
});

function PlannerTool() {
  const navigate = useNavigate();
  const plan = useServerFn(planTasks);
  const [workingHours, setWorkingHours] = useState("08:00 – 16:30");
  const [tasks, setTasks] = useState<Task[]>([emptyTask()]);
  const [sourceNote, setSourceNote] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlannerOutput | null>(null);

  useEffect(() => {
    const handoff = takeHandoff("planner");
    if (handoff && handoff.tasks.length) {
      setTasks(
        handoff.tasks.map((t) => ({
          name: t.name,
          deadline: t.deadline,
          priority: (["Critical", "High", "Medium", "Low"].includes(t.priority)
            ? t.priority
            : "Unspecified") as Task["priority"],
          duration: t.duration,
          dependency: t.dependency,
        })),
      );
      setSourceNote(handoff.source);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (input: PlannerInput) => plan({ data: input }),
    onSuccess: (output, input) => {
      setResult(output);
      saveHistory({
        kind: "planner",
        title: `Plan · ${input.tasks.length} tasks · ${input.workingHours}`,
        input,
        output,
      });
    },
  });

  const submit = () => {
    const cleaned = tasks.filter((t) => t.name.trim().length > 0);
    const parsed = plannerInputSchema.safeParse({ workingHours, tasks: cleaned });
    if (!parsed.success) {
      setErrors({ form: parsed.error.issues[0]?.message ?? "Please check the form" });
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  };

  const asText = result
    ? [
        `Working hours: ${workingHours}`,
        "",
        "SCHEDULE",
        ...result.schedule.map((s) => `${s.slot} — ${s.task} [${s.priority}] · ${s.rationale}`),
        "",
        "RECOMMENDED ORDER",
        ...result.recommendedOrder.map((r, i) => `${i + 1}. ${r}`),
        "",
        "DEADLINE RISKS",
        ...result.deadlineRisks.map((r) => `- ${r}`),
        "",
        "TIME-SAVING SUGGESTIONS",
        ...result.timeSavingSuggestions.map((s) => `- ${s}`),
      ].join("\n")
    : "";

  const draftEmailFor = (taskName: string, rationale: string) => {
    setHandoff({
      target: "email",
      source: "AI Task Planner",
      purpose: `Update stakeholders on: ${taskName}`,
      details: `Task from my plan: ${taskName}. Planner note: ${rationale}`,
    });
    navigate({ to: "/tools/email" });
  };

  return (
    <AppShell title="AI Task Planner" subtitle="Tasks → AI prioritisation → your review → your day">
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Panel title="Your task list" badge="Tool 03">
            <div className="space-y-4">
              {sourceNote && (
                <p className="rounded-lg border border-violet/25 bg-violet/5 px-3 py-2 text-[11px] text-violet">
                  Imported action items from “{sourceNote}”. Review and edit before planning.
                </p>
              )}

              <Field label="Available working hours">
                <TextInput
                  value={workingHours}
                  placeholder="e.g. 08:00 – 16:30"
                  onChange={(e) => setWorkingHours(e.target.value)}
                />
              </Field>

              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={index} className="rounded-xl border border-line bg-obsidian/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] tracking-wider text-muted-ink uppercase">
                        Task {index + 1}
                      </span>
                      <button
                        aria-label="Remove task"
                        className="text-muted-ink transition hover:text-destructive"
                        onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <TextInput
                      className="mt-2"
                      value={task.name}
                      placeholder="Task description"
                      onChange={(e) =>
                        setTasks(
                          tasks.map((t, i) => (i === index ? { ...t, name: e.target.value } : t)),
                        )
                      }
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <TextInput
                        value={task.deadline}
                        placeholder="Deadline (optional)"
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t, i) =>
                              i === index ? { ...t, deadline: e.target.value } : t,
                            ),
                          )
                        }
                      />
                      <TextInput
                        value={task.duration}
                        placeholder="Est. duration"
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t, i) =>
                              i === index ? { ...t, duration: e.target.value } : t,
                            ),
                          )
                        }
                      />
                      <Select
                        value={task.priority}
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t, i) =>
                              i === index
                                ? { ...t, priority: e.target.value as Task["priority"] }
                                : t,
                            ),
                          )
                        }
                      >
                        {["Unspecified", "Critical", "High", "Medium", "Low"].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </Select>
                      <TextInput
                        value={task.dependency}
                        placeholder="Depends on (optional)"
                        onChange={(e) =>
                          setTasks(
                            tasks.map((t, i) =>
                              i === index ? { ...t, dependency: e.target.value } : t,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <GhostButton onClick={() => setTasks([...tasks, emptyTask()])}>
                <Plus className="size-3.5" />
                Add task
              </GhostButton>

              {errors["form"] && <p className="text-[11px] text-destructive">{errors["form"]}</p>}

              <PrimaryButton className="w-full" disabled={mutation.isPending} onClick={submit}>
                {mutation.isPending ? "Planning…" : "Build my schedule"}
              </PrimaryButton>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <Panel title="Planned day" glow badge="Human review">
            {mutation.isPending && <Skeleton />}
            {mutation.isError && !mutation.isPending && (
              <ErrorState
                message={
                  (mutation.error as Error)?.message ||
                  "The plan could not be generated. Please try again."
                }
                onRetry={submit}
              />
            )}
            {!mutation.isPending && !mutation.isError && !result && (
              <p className="text-xs text-muted-ink">
                Add your tasks — LogiMate sequences them by urgency, impact, deadlines and
                dependencies. It has no access to fleet, GPS or calendar data.
              </p>
            )}
            {result && !mutation.isPending && (
              <div className="space-y-5">
                <div className="space-y-2">
                  {result.schedule.map((s, i) => (
                    <div
                      key={`${s.task}-${i}`}
                      className="rounded-lg border border-line bg-obsidian/40 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-frost">{s.task}</p>
                          <p className="text-[11px] text-muted-ink">
                            {s.slot} · {s.rationale}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <PriorityChip priority={s.priority} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <button
                          className="text-[11px] text-cyan transition hover:brightness-125"
                          onClick={() => draftEmailFor(s.task, s.rationale)}
                        >
                          Draft an email about this →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {result.recommendedOrder.length > 0 && (
                  <div>
                    <p className="text-[11px] tracking-wider text-cyan uppercase">
                      Recommended order
                    </p>
                    <ol className="mt-2 space-y-1.5">
                      {result.recommendedOrder.map((r, i) => (
                        <li key={`${r}-${i}`} className="text-xs text-muted-ink">
                          {i + 1}. {r}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <MissingInfo items={result.deadlineRisks} label="Potential deadline risks" />

                {result.timeSavingSuggestions.length > 0 && (
                  <div className="rounded-lg border border-mint/25 bg-mint/5 p-3">
                    <p className="text-[11px] tracking-wider text-mint uppercase">
                      Time-saving suggestions
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {result.timeSavingSuggestions.map((s, i) => (
                        <li key={`${s}-${i}`} className="flex gap-2 text-xs text-muted-ink">
                          <span className="text-mint">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <MissingInfo items={result.missingInformation} />

                <OutputActions
                  text={asText}
                  onRegenerate={submit}
                  exportName="logimate-plan"
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
