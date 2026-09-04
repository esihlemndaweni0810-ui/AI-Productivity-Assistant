# LogiMate AI Assistant

Build a modern, professional, responsive web application called LogiMate AI, an AI-powered productivity assistant for a logistics company.

The purpose is to help logistics employees reduce repetitive administrative work and improve operational efficiency.

Core Features

1. Smart Email Generator

Create a tool for generating professional logistics-related emails.

Inputs:

Recipient: Customer, Driver, Manager, Supplier, Team

Email purpose

Relevant details

Tone: Formal, Professional, Friendly, Apologetic

Length: Short, Medium, Detailed

AI Output:

Subject line

Professional email

Missing information/assumptions

Allow users to Copy, Edit, Regenerate, and Adjust Tone.

The AI must only use information provided by the user and must not invent shipment numbers, dates, names, locations, or delivery commitments.

2. Meeting Notes Summarizer

Create a tool for summarising logistics meetings and operational briefings.

Inputs:

Meeting title

Date

Attendees

Meeting notes/transcript

AI Output:

Meeting summary

Key discussion points

Decisions made

Action items

Responsible person

Deadlines

Follow-up items

If a person or deadline is not provided, display "Not specified" rather than inventing information.

Allow users to Copy, Edit, Regenerate, and Export the summary.

3. AI Task Planner

Create an AI-powered planner for organising daily logistics tasks.

Inputs:

Task list

Deadlines

Priority

Estimated duration

Available working hours

Optional dependencies

AI Output:

Prioritised task list

Daily schedule

Critical/High/Medium/Low priority

Recommended task order

Potential deadline risks

Time-saving suggestions

The AI must prioritise tasks based on urgency, importance, deadlines, operational impact, and dependencies.

Do not assume access to real GPS, fleet, driver, calendar, or shipment data unless it is explicitly provided.

Website Structure

Create:

Landing Page

Dashboard

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

History

The dashboard should provide quick access to the three tools and display simple estimated productivity metrics such as tasks completed, emails generated, meetings summarised, and estimated time saved.

Design

Use a clean, professional logistics/business aesthetic with:

Responsive desktop and mobile design

Simple navigation/sidebar

Consistent cards, forms and buttons

Clear loading and error states

Form validation

Copy/Edit/Regenerate functionality

Professional typography

Intuitive user experience

Each feature should follow:

INPUT → AI PROCESSING → OUTPUT → HUMAN REVIEW → ACTION

Responsible AI

Include a visible disclaimer:

"AI-generated information may contain errors. Always review and verify important information before using it in professional communications or operational decisions."

The AI must:

Avoid hallucinating information.

Clearly identify missing information.

Never fabricate facts.

Keep humans responsible for final decisions.

Key Innovation

Connect the three tools into one workflow:

Meeting Notes → Action Items → AI Task Planner

and

Task/Operational Issue → Smart Email Generator

The final website should feel like one integrated AI logistics productivity assistant, not three separate tools.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://freight-mate-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e60dc49-f663-40fb-8bd1-13eeda6927c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
