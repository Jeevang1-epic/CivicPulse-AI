# 12 — Context Window Strategy

The user has limited weekly usage. So use fewer, stronger prompts.

## Recommended Codex sequence

1. `MASTER_CONTEXT_PROMPT.md`
2. `PROMPT_01_BOOTSTRAP.md`
3. `PROMPT_02_CORE_APP.md`
4. `PROMPT_03_AI_TRIAGE.md`
5. `PROMPT_04_DASHBOARDS.md`
6. `PROMPT_05_POLISH_QA_DEPLOY.md`

## Do not paste every file every time

At the start, tell Codex:
- "Read the whole context pack first."
- Then run one phase prompt at a time.

## When Codex fails

Use this debug prompt:

```txt
Stop adding features. Do root-cause debugging only.
1. Reproduce the error.
2. Identify the exact failing file/function.
3. Explain the cause in 3 lines.
4. Apply the smallest safe fix.
5. Run the relevant validation command.
6. Do not rewrite unrelated files.
```

## When UI looks generic

Use this prompt:

```txt
Improve the UI without changing core logic.
Make it feel like a polished civic-tech SaaS dashboard:
- better spacing
- stronger hero
- clearer cards
- better status badges
- mobile responsive
- no fake data claims
Keep the current routes and types.
```

## When time is almost over

Use this prompt:

```txt
Freeze scope. Prepare for submission.
Fix only:
- build errors
- broken navigation
- broken report submission
- broken deployment config
- missing README/deploy instructions
Do not add new features.
```
