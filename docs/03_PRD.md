# 03 — Product Requirements Document

## Product name

CivicPulse AI

## User personas

### 1. Citizen
Wants to quickly report a local problem and know whether anyone is acting on it.

### 2. Volunteer
Wants to find local issues where community help is possible, such as cleanup, lost-and-found, campus support, or awareness.

### 3. Local admin / organizer
Wants to see the highest-priority issues, reduce duplicate complaints, update status, and communicate progress.

### 4. Judge / evaluator
Wants to see a working project, not only slides.

## Core user stories

### Citizen
- As a citizen, I can submit a report with description and location.
- As a citizen, I can see my report transformed into a clear issue card.
- As a citizen, I can track status publicly.
- As a citizen, I can support/upvote an existing issue instead of creating duplicates.

### Admin/volunteer
- As an admin, I can view all reports by severity and category.
- As an admin, I can update status.
- As an admin, I can read an AI action plan.
- As a volunteer, I can mark that I can help.

### System
- As a system, I can classify reports into structured fields.
- As a system, I can fail gracefully when AI is unavailable.
- As a system, I can seed demo data for judges.

## MVP feature list

### Must-have
- Landing page.
- Report issue form.
- AI triage API.
- Firestore persistence.
- Public issue board.
- Admin dashboard.
- Status updates.
- Seed data.
- Google Cloud Run deployment.

### Should-have
- Simple map panel or Google Maps link.
- Duplicate grouping indicator.
- Neighborhood summary.
- AI-generated citizen-friendly response.
- Filter by category/severity/status.

### Could-have
- Image upload.
- Voice input.
- Multilingual mode.
- PWA offline queue.
- Heatmap.
- WhatsApp notification.

### Won't-have for hackathon
- Real government integration.
- Real emergency dispatch.
- Production-grade identity verification.
- Payment flow.
- Complex native mobile app.

## Functional requirements

### Report creation
Input:
- description
- location text
- optional category
- optional urgency
- optional photo URL or placeholder

Output:
- structured issue stored in database
- AI triage object
- user-facing confirmation

### AI triage
The API should return:
- title
- cleaned summary
- category
- severity 1–5
- safety level: low / medium / urgent / critical
- duplicate key
- suggested responsible team
- recommended action
- citizen response
- flags: needs human review, unsafe content, insufficient info

### Dashboard
Admin dashboard should show:
- total reports
- open reports
- urgent reports
- resolved reports
- table/list of reports
- status transition controls
- top categories
- AI daily brief

## Non-functional requirements

- Works on mobile and desktop.
- Loads under 3 seconds on normal connection.
- No secrets committed.
- Deployed on Google Cloud.
- Reasonable fallback if Gemini fails.
- Minimal personal data collection.
- Clear disclaimer: not an emergency service.

## Definition of done

- App runs locally with `npm run dev`.
- App builds with `npm run build`.
- At least one test/lint command passes.
- Demo seed data available.
- Cloud Run URL works.
- README explains setup/deploy.
- Video demo script ready.
