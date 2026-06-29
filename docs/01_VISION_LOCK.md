# 01 — Vision Lock

## Mission

Build **CivicPulse AI**, a hyperlocal community issue-response platform that turns scattered citizen complaints into prioritized, actionable civic work.

Instead of just a complaint form, the app becomes a mini operating system:

- Citizens submit reports.
- AI triages reports into category, urgency, safety level, duplicate group, and recommended action.
- A public community board builds trust by showing progress.
- Volunteers/admins get a live dashboard showing what needs attention first.
- Neighborhood summaries help explain what changed today.

## Problem statement fit

Chosen track: **Community Hero - Hyperlocal Problem Solver**

Why it fits:
- Hyperlocal: every report is tied to a neighborhood/location.
- Problem-solving: it does not stop at reporting; it triages, groups, assigns, and tracks.
- Community: citizens, volunteers, and local admins have different views.
- Functional: can be built, deployed, and demonstrated within the deadline.

## One-line pitch

**CivicPulse AI helps neighborhoods turn local problems into prioritized, trackable action using Gemini, Firestore, and Google Cloud Run.**

## What we are building

### Citizen side
- Landing page with mission, live stats, and clear CTA.
- Report form: issue description, category guess, location text, optional urgency, optional image URL/upload placeholder.
- AI-generated confirmation message.
- Public status board.
- Report details page.

### Community side
- Upvote / "I also saw this" button.
- Help offer button for volunteer-type tasks.
- Duplicate report grouping concept.
- Neighborhood summary.

### Admin/volunteer side
- Dashboard with queue.
- Severity, category, status filters.
- AI-generated action plan.
- Status transitions: Open → In Review → Assigned → Resolved.
- Analytics cards: open issues, critical issues, top categories, average resolution progress.

## What makes it portfolio-level

Most hackathon apps are just forms. This one shows:

- Full-stack product thinking.
- Real-time database design.
- AI structured output.
- Role-based UX.
- Google Cloud deployment.
- Clear social impact.
- Safety and privacy guardrails.
- Scope discipline under deadline.

## Non-goals for hackathon MVP

Do **not** build these during the hackathon unless the core is finished:

- Real municipal/government integration.
- Real emergency dispatch.
- Real payment system.
- Complex native mobile app.
- OTP-heavy production auth.
- Fully automated assignment to real officials.
- Medical, legal, or emergency advice.

## Success criteria

The MVP is successful if:

- A judge can create a report in under 30 seconds.
- The AI returns useful structured triage.
- The report appears in the public board/dashboard.
- Admin can change status.
- Dashboard shows priority and neighborhood summary.
- The app is deployed on Google Cloud.
- The demo can be explained in 4–5 minutes.
- The repo looks professional enough for portfolio use.

## Final locked scope

Build **one polished Cloud Run deployed web app** with:
- Next.js + TypeScript
- Tailwind/shadcn-style UI
- Firebase/Firestore
- Gemini API route
- Demo seed data
- Graceful fallback if Gemini key is unavailable
- Clear README and demo video script
