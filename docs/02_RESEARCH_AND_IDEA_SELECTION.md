# 02 — Research and Idea Selection

## Track comparison

### Option A — The Last-Minute Life Saver

Possible project:
- Emergency readiness assistant.
- Find closest help.
- Time-sensitive checklist generator.
- Crisis contact organizer.

Strengths:
- Emotionally strong.
- High urgency.
- Good story for judges.

Risks:
- Safety liability if it appears to replace emergency services.
- Real-time data reliability is hard.
- Medical/emergency advice can become risky.
- Needs highly accurate location and service data.
- Hard to make truly functional in a few days without fake claims.

Verdict: powerful but risky for a short hackathon. Could be used as a **critical priority module**, not the whole product.

### Option B — Community Hero - Hyperlocal Problem Solver

Possible project:
- Report and resolve neighborhood problems.
- Prioritize local issues.
- Coordinate citizens and volunteers.
- Build trust through transparent status updates.

Strengths:
- Broad and realistic.
- Easy to demo with seeded data.
- Strong Google Cloud + AI fit.
- Safer than emergency/medical apps.
- Can become a long-term portfolio project.
- Supports multiple user roles and dashboard depth.

Risks:
- Can become generic if it is only a complaint form.
- Needs a strong differentiator.

Verdict: best choice. We avoid genericness by making it an **AI triage + civic operations dashboard**, not just a report app.

## Locked idea

**CivicPulse AI — Hyperlocal civic issue triage and response platform.**

## Core insight

Most local problems do not fail because people cannot complain. They fail because complaints are:

- scattered across WhatsApp groups,
- duplicated,
- unstructured,
- not prioritized,
- not visible after reporting,
- hard for volunteers/admins to convert into action.

CivicPulse AI solves that middle layer.

## Differentiator

The product converts messy local reports into structured civic operations data:

```json
{
  "title": "Streetlight outage near main junction",
  "category": "Streetlight",
  "severity": 4,
  "safetyLevel": "urgent",
  "duplicateKey": "streetlight-main-junction",
  "responsibleTeam": "Electrical maintenance",
  "recommendedAction": "Inspect pole and power line; prioritize due to night safety risk",
  "citizenReply": "Thanks. This has been marked urgent because it affects night visibility."
}
```

## Why judges should like it

- It is not a toy chatbot.
- It solves a clear coordination problem.
- It uses AI as a useful workflow layer.
- It has visible dashboards and metrics.
- It has a clear deployment story.
- It can scale from campus → colony → ward → city.

## Why it will stay in portfolio

After the hackathon, this can become:

- a civic-tech flagship project,
- a Google Cloud portfolio case study,
- a product demo for NGOs/campus/civic bodies,
- a strong full-stack + AI + systems architecture proof.
