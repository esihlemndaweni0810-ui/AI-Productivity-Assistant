import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Disclaimer,
  ErrorState,
  Field,
  MissingInfo,
  OutputActions,
  Panel,
  PrimaryButton,
  Select,
  Skeleton,
  TextArea,
  TextInput,
  GhostButton,
} from "@/components/ai-ui";
import { emailInputSchema, generateEmail, type EmailInput, type EmailOutput } from "@/lib/ai.functions";
import { saveHistory, takeHandoff } from "@/lib/store";

export const Route = createFileRoute("/tools/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — LogiMate AI" },
      {
        name: "description",
        content:
          "Generate professional logistics emails for customers, drivers, managers, suppliers and teams — using only the details you provide.",
      },
      { property: "og:title", content: "Smart Email Generator — LogiMate AI" },
      {
        property: "og:description",
        content: "Draft logistics emails with clear tone, length and missing-information flags.",
      },
    ],
  }),
  component: EmailTool,
});

const EMPTY: EmailInput = {
  recipient: "Customer",
  purpose: "",
  details: "",
  tone: "Professional",
  length: "Medium",
};

function EmailTool() {
  const navigate = useNavigate();
  const generate = useServerFn(generateEmail);
  const [form, setForm] = useState<EmailInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<EmailOutput | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const handoff = takeHandoff("email");
    if (handoff) {
      setForm((f) => ({ ...f, purpose: handoff.purpose, details: handoff.details }));
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (input: EmailInput) => generate({ data: input }),
    onSuccess: (output, input) => {
      setDraft(output);
      setEditing(false);
      saveHistory({
        kind: "email",
        title: `Email · ${input.recipient} · ${input.purpose}`,
        input,
        output,
      });
    },
  });

  const submit = (override?: Partial<EmailInput>) => {
    const next = { ...form, ...override };
    const parsed = emailInputSchema.safeParse(next);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setForm(next);
    mutation.mutate(parsed.data);
  };

  const fullText = draft ? `Subject: ${draft.subject}\n\n${draft.body}` : "";

  return (
    <AppShell title="Smart Email Generator" subtitle="Input → AI draft → your review → send">
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Panel title="Email brief" badge="Tool 01">
            <div className="space-y-4">
              <Field label="Recipient">
                <Select
                  value={form.recipient}
                  onChange={(e) =>
                    setForm({ ...form, recipient: e.target.value as EmailInput["recipient"] })
                  }
                >
                  {["Customer", "Driver", "Manager", "Supplier", "Team"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Email purpose" error={errors["purpose"]}>
                <TextInput
                  value={form.purpose}
                  placeholder="e.g. Notify the customer of a delivery delay"
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </Field>

              <Field label="Relevant details" error={errors["details"]}>
                <TextArea
                  rows={5}
                  value={form.details}
                  placeholder="Only facts you have. LogiMate will not invent references, dates or ETAs."
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tone">
                  <Select
                    value={form.tone}
                    onChange={(e) => setForm({ ...form, tone: e.target.value as EmailInput["tone"] })}
                  >
                    {["Formal", "Professional", "Friendly", "Apologetic"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Length">
                  <Select
                    value={form.length}
                    onChange={(e) =>
                      setForm({ ...form, length: e.target.value as EmailInput["length"] })
                    }
                  >
                    {["Short", "Medium", "Detailed"].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <PrimaryButton
                className="w-full"
                disabled={mutation.isPending}
                onClick={() => submit()}
              >
                {mutation.isPending ? "Generating…" : "Generate email"}
              </PrimaryButton>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <Panel title="Draft output" glow badge="Human review">
            {mutation.isPending && <Skeleton />}
            {mutation.isError && !mutation.isPending && (
              <ErrorState
                message={
                  (mutation.error as Error)?.message ||
                  "The draft could not be generated. Please try again."
                }
                onRetry={() => submit()}
              />
            )}
            {!mutation.isPending && !mutation.isError && !draft && (
              <p className="text-xs text-muted-ink">
                Fill in the brief and generate a draft. Nothing is sent anywhere — you stay in
                control of the final email.
              </p>
            )}
            {draft && !mutation.isPending && (
              <div className="space-y-4">
                <div className="rounded-lg border border-cyan/25 bg-obsidian/50 p-3">
                  <p className="text-[11px] tracking-wider text-cyan uppercase">Subject</p>
                  {editing ? (
                    <TextInput
                      className="mt-2"
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 font-display text-[14px] font-medium text-frost">
                      {draft.subject}
                    </p>
                  )}
                </div>

                {editing ? (
                  <TextArea
                    rows={14}
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-frost/90">
                    {draft.body}
                  </p>
                )}

                <MissingInfo items={draft.missingInformation} />
                <MissingInfo items={draft.assumptions} label="Assumptions made" />

                <OutputActions
                  text={fullText}
                  editing={editing}
                  onEdit={() => setEditing((v) => !v)}
                  onRegenerate={() => submit()}
                  exportName="logimate-email"
                  extra={
                    <>
                      <Select
                        className="w-auto py-1.5 text-xs"
                        value={form.tone}
                        onChange={(e) =>
                          submit({ tone: e.target.value as EmailInput["tone"] })
                        }
                        aria-label="Adjust tone"
                      >
                        {["Formal", "Professional", "Friendly", "Apologetic"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </Select>
                      <GhostButton onClick={() => navigate({ to: "/tools/planner" })}>
                        Plan follow-up →
                      </GhostButton>
                    </>
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
