# 05 — AI Design

## Role of AI

AI should not be a decoration. It should do operational work:

- convert messy natural-language reports into structured civic issue data,
- detect urgency,
- suggest responsible team,
- create citizen-friendly response,
- generate an admin action plan,
- summarize neighborhood trends.

## AI model behavior

The model must return structured JSON only. No long free-text paragraphs for the backend.

## Triage schema

```ts
export type TriageResult = {
  title: string;
  cleanedSummary: string;
  category:
    | "Road"
    | "Streetlight"
    | "Garbage"
    | "Water"
    | "Safety"
    | "Animal"
    | "Public Transport"
    | "Lost and Found"
    | "Noise"
    | "Other";
  severity: 1 | 2 | 3 | 4 | 5;
  safetyLevel: "low" | "medium" | "urgent" | "critical";
  duplicateKey: string;
  responsibleTeam: string;
  recommendedAction: string;
  citizenReply: string;
  needsHumanReview: boolean;
  insufficientInfo: boolean;
  safetyDisclaimerRequired: boolean;
};
```

## Severity guide

- **1:** minor inconvenience, no safety impact.
- **2:** local inconvenience, can wait.
- **3:** visible community issue, should be handled soon.
- **4:** urgent civic risk, could affect safety or services.
- **5:** critical hazard, human review required immediately.

## Safety rules

- The app is not an emergency service.
- For immediate danger, the app should tell users to contact local emergency services.
- Do not provide medical, legal, or dangerous instructions.
- Do not claim that a report has been sent to real authorities unless a real integration exists.
- Do not expose exact home addresses publicly; allow approximate location display.

## System prompt draft

```txt
You are CivicPulse AI, a civic issue triage assistant.
Convert citizen reports into structured civic operations JSON.
Be practical, concise, and safety-aware.

Rules:
- Return valid JSON matching the schema.
- Do not invent official integrations.
- If immediate danger is described, set safetyLevel to "critical",
  needsHumanReview to true, and safetyDisclaimerRequired to true.
- Do not give medical, legal, or emergency instructions beyond advising the user
  to contact appropriate local emergency services.
- Prefer clear civic categories.
- Create a duplicateKey using lowercase keywords and approximate location text.
- recommendedAction must be operational and safe.
```

## User prompt template

```txt
Citizen report:
Description: {{description}}
Location text: {{locationText}}
User selected category: {{categoryOrUnknown}}
User selected urgency: {{urgencyOrUnknown}}

Return only JSON.
```

## Example

Input:
```txt
Streetlight not working near the college back gate for 4 days. Road is dark at night.
```

Output:
```json
{
  "title": "Streetlight outage near college back gate",
  "cleanedSummary": "A streetlight near the college back gate has been non-functional for four days, making the road dark at night.",
  "category": "Streetlight",
  "severity": 4,
  "safetyLevel": "urgent",
  "duplicateKey": "streetlight-college-back-gate",
  "responsibleTeam": "Electrical maintenance",
  "recommendedAction": "Inspect the streetlight pole and power connection; prioritize because the issue affects night visibility.",
  "citizenReply": "Thanks for reporting. This has been marked urgent because it affects night-time safety.",
  "needsHumanReview": true,
  "insufficientInfo": false,
  "safetyDisclaimerRequired": false
}
```

## AI features to show judges

1. Triage card after report submission.
2. "Why this is urgent" explanation.
3. Duplicate group label.
4. Neighborhood daily brief.
5. Admin action plan.
