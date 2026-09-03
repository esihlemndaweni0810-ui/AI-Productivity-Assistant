import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { AI_MODEL, createLovableAiGatewayProvider, requireLovableApiKey } from "./ai-gateway.server";

const GROUND_RULES = `You are LogiMate AI, an assistant for logistics operations staff.
STRICT RULES:
- Use ONLY information the user provided. Never invent shipment numbers, tracking IDs, dates, times, names, addresses, locations, prices or delivery commitments.
- If a needed detail is missing, say "Not specified" or leave a clearly marked placeholder, and list it as missing information.
- You have no access to GPS, fleet, driver, calendar, ERP or shipment systems. Never imply that you do.
- Humans make the final decision. Do not state anything as confirmed unless the user stated it.`;

async function runStructured<T>(schema: z.ZodType<T>, system: string, prompt: string): Promise<T> {
  const key = requireLovableApiKey();
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const result = streamText({
      model: gateway(AI_MODEL),
      system,
      prompt,
      output: Output.object({ schema }),
    });
    return (await result.output) as T;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The AI response could not be read. Please try regenerating.");
    }
    throw error;
  }
}

/* ---------------- Smart Email Generator ---------------- */

export const emailInputSchema = z.object({
  recipient: z.enum(["Customer", "Driver", "Manager", "Supplier", "Team"]),
  purpose: z.string().min(3, "Describe the purpose of the email"),
  details: z.string().min(3, "Add the details the email should be based on"),
  tone: z.enum(["Formal", "Professional", "Friendly", "Apologetic"]),
  length: z.enum(["Short", "Medium", "Detailed"]),
});
export type EmailInput = z.infer<typeof emailInputSchema>;

const emailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  missingInformation: z.array(z.string()),
  assumptions: z.array(z.string()),
});
export type EmailOutput = z.infer<typeof emailOutputSchema>;

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInputSchema.parse(data))
  .handler(async ({ data }) => {
    return runStructured(
      emailOutputSchema,
      `${GROUND_RULES}\nWrite professional logistics emails. Keep Short ≈ 60 words, Medium ≈ 120 words, Detailed ≈ 220 words. Use neutral placeholders like [shipment reference] when a fact was not supplied, and list each of those under missingInformation.`,
      `Recipient type: ${data.recipient}
Tone: ${data.tone}
Length: ${data.length}
Purpose: ${data.purpose}
Details provided by the user:
${data.details}

Return the subject line, the full email body (greeting to sign-off), a list of missing information, and a list of assumptions you made.`,
    );
  });

/* ---------------- Meeting Notes Summarizer ---------------- */

export const meetingInputSchema = z.object({
  title: z.string().min(2, "Add a meeting title"),
  date: z.string().min(1, "Add the meeting date"),
  attendees: z.string().min(2, "Add at least one attendee"),
  notes: z.string().min(20, "Paste the meeting notes or transcript"),
});
export type MeetingInput = z.infer<typeof meetingInputSchema>;

const meetingOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
      priority: z.enum(["Critical", "High", "Medium", "Low"]),
    }),
  ),
  followUps: z.array(z.string()),
  missingInformation: z.array(z.string()),
});
export type MeetingOutput = z.infer<typeof meetingOutputSchema>;

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => meetingInputSchema.parse(data))
  .handler(async ({ data }) => {
    return runStructured(
      meetingOutputSchema,
      `${GROUND_RULES}\nSummarise logistics meetings. Whenever an owner or deadline is not stated in the notes, use exactly "Not specified". Never guess a person or a date. Priority is your assessment of urgency based only on what the notes say.`,
      `Meeting title: ${data.title}
Date: ${data.date}
Attendees: ${data.attendees}
Notes / transcript:
${data.notes}`,
    );
  });

/* ---------------- AI Task Planner ---------------- */

export const plannerTaskSchema = z.object({
  name: z.string().min(1),
  deadline: z.string(),
  priority: z.enum(["Critical", "High", "Medium", "Low", "Unspecified"]),
  duration: z.string(),
  dependency: z.string(),
});

export const plannerInputSchema = z.object({
  workingHours: z.string().min(1, "Enter your available working hours"),
  tasks: z.array(plannerTaskSchema).min(1, "Add at least one task"),
});
export type PlannerInput = z.infer<typeof plannerInputSchema>;

const plannerOutputSchema = z.object({
  schedule: z.array(
    z.object({
      slot: z.string(),
      task: z.string(),
      priority: z.enum(["Critical", "High", "Medium", "Low"]),
      rationale: z.string(),
    }),
  ),
  recommendedOrder: z.array(z.string()),
  deadlineRisks: z.array(z.string()),
  timeSavingSuggestions: z.array(z.string()),
  missingInformation: z.array(z.string()),
});
export type PlannerOutput = z.infer<typeof plannerOutputSchema>;

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => plannerInputSchema.parse(data))
  .handler(async ({ data }) => {
    return runStructured(
      plannerOutputSchema,
      `${GROUND_RULES}\nPrioritise logistics tasks by urgency, operational impact, deadlines and dependencies. Only schedule inside the stated working hours. Use "Not specified" where a deadline or duration was not given, and never invent one.`,
      `Available working hours: ${data.workingHours}
Tasks:
${data.tasks
  .map(
    (t, i) =>
      `${i + 1}. ${t.name} | deadline: ${t.deadline || "Not specified"} | user priority: ${t.priority} | estimated duration: ${t.duration || "Not specified"} | depends on: ${t.dependency || "None"}`,
  )
  .join("\n")}`,
    );
  });
