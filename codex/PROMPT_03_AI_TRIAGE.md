# Prompt 03 — Gemini AI Triage

```txt
Continue CivicPulse AI.

Implement Gemini-powered AI triage with safe fallback.

Requirements:
1. Add server-only Gemini service.
2. Read GEMINI_API_KEY from server env.
3. Use a structured prompt to return JSON matching TriageResult.
4. Validate/normalize model output.
5. Add deterministic fallback classifier when GEMINI_API_KEY is missing or model call fails.
6. Add safety behavior:
   - critical immediate danger => severity 5, safetyLevel critical, needsHumanReview true, safetyDisclaimerRequired true
   - do not provide medical/legal/dangerous instructions
   - show "not an emergency service" disclaimer in UI for critical cases
7. Add a "Why this priority?" panel on report result/details.
8. Add tests or simple validation utility for sample inputs.

Acceptance:
- Streetlight example becomes Streetlight severity 4/urgent.
- Garbage example becomes Garbage severity 2 or 3.
- Water leak example becomes Water severity 4/urgent.
- Vague input sets insufficientInfo true.
- Build passes.
```
