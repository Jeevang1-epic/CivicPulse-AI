# 07 — UI/UX Flow

## Visual direction

Design should feel like a serious Google Cloud / civic-tech product, not a generic student project.

Suggested feel:
- Clean white/soft grey background.
- Accent: civic blue + green.
- Cards with rounded corners.
- High information density but not clutter.
- Strong dashboard charts/cards.
- Mobile-first report flow.

## Pages

### `/`
Landing page:
- Hero: "Turn local problems into trackable action."
- CTA: Report an issue.
- Stats: open issues, resolved issues, urgent issues.
- How it works: Report → AI triage → Community action → Resolution.
- Demo board preview.

### `/report`
Citizen report form:
- Issue description textarea.
- Location text.
- Category optional.
- Urgency optional.
- Submit button.
- Loading state: "CivicPulse AI is triaging this report..."
- Result card after submission.

### `/board`
Public issue board:
- Filter chips: all, urgent, road, water, garbage, streetlight.
- Issue cards.
- Support button.
- Status badges.
- "Open in Maps" link.

### `/dashboard`
Admin/volunteer dashboard:
- KPI cards.
- Priority queue.
- Category chart/list.
- AI daily brief.
- Status update controls.
- Action plan drawer/modal.

### `/reports/[id]`
Report details:
- Full summary.
- Timeline.
- Recommended action.
- Status history.
- Support/help counts.

## Key demo flow

1. Open landing page.
2. Click "Report issue."
3. Submit: "Water leakage near main road causing slippery surface."
4. Show AI triage.
5. Go to public board and show new card.
6. Go dashboard and show priority queue.
7. Change status to "Assigned."
8. Show neighborhood brief.

## Microcopy

- "AI triage is advisory; human review is required for urgent cases."
- "This demo does not send reports to real authorities."
- "For immediate danger, contact local emergency services."

## Empty states

- No reports: show seed demo button or friendly empty card.
- AI unavailable: show fallback triage message.
- Firestore unavailable: show local demo data warning.

## Mobile priority

Judges may open link on mobile. Ensure:
- report form fits mobile,
- board cards are readable,
- dashboard has stacked cards.
