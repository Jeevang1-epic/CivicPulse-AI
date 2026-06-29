# 08 — Security, Privacy, and Safety

## Security

- Keep all API keys in environment variables.
- Never expose Gemini API key in frontend.
- Use server route for AI calls.
- Use Firestore rules to limit public writes.
- Sanitize text inputs.
- Keep admin actions behind demo admin guard or server route.
- Do not commit `.env.local`.

## Privacy

Collect only what is needed:
- issue description
- approximate location
- optional image
- no phone number for MVP
- no government IDs

For public display:
- avoid exact private addresses,
- show approximate location text,
- hide sensitive content if flagged.

## Safety

The app must not act as an emergency service.

Required disclaimer:
> CivicPulse AI is a community reporting demo. It does not replace emergency services or official municipal systems. If there is immediate danger, contact local emergency services.

## AI safety behavior

For critical reports:
- set `needsHumanReview: true`
- show emergency disclaimer
- avoid detailed dangerous/medical instructions
- tell user to contact appropriate emergency services
- keep recommendations operational and safe

## Data integrity

Avoid fake claims:
- Do not say "sent to municipality" unless integration exists.
- Use "Marked for admin review" or "Added to community dashboard."
- Status changes are demo workflow, not official action.

## Abuse handling

MVP handling:
- report content length limits,
- category validation,
- safety flag,
- admin review flag.

Future handling:
- authentication,
- rate limiting,
- abuse reporting,
- moderation queue.
