---
name: write-skill
description: Use when Suhas or the lead wants a new skill or an agent-instruction change for Tantu Kala. Test first — record how the agent fails without it — then the smallest skill that fixes it, then prove it passes.
---

# Write skill (test-first)

Credits: obra/superpowers `writing-skills` (MIT); Anthropic `skill-creator`;
keez97/claude-architecture-skills evals (MIT).

1. **Baseline:** run a realistic prompt without the skill; note what went wrong and the excuses.
2. **Case:** `docs/v2/claude-code/evals/<skill>/cases.json` —
   `{ "id", "prompt", "expectations": [ {"type":"regex-absent"|"regex-present"|"lint-clean"|"judge", …} ] }`.
   Prefer checks a script can do.
3. **Skill:** frontmatter `name` + `description` that says *when* to use it; the smallest
   instructions that fix the recorded failure; ≤ 300 lines; long reference material in
   `references/`; credits for any borrowed idea; no network calls or install scripts.
4. **Prove:** `node docs/v2/claude-code/evals/run.mjs <skill>` (and `--baseline` to show the
   difference). Then one harder prompt; close the gap; re-run.
5. It's a kit file: Suhas applies it through a PR (owner-only path).
