---
name: humanize
description: Use as the last pass on any Tantu Kala text a customer, Suhas or the public will read — product copy, page copy, Instagram captions and scripts, WhatsApp/email replies, reviews of work, analyses, reports. Removes AI-writing patterns in the brand voice without changing facts.
---

# Humanize

Credits: patterns adapted from blader/humanizer v3.1 (MIT, built on Wikipedia "Signs of AI
writing") and hardikpandya/stop-slop (MIT). Rewritten for Tantu Kala.

1. Run `node .claude/scripts/prose-lint.mjs <file> --extra docs/truth/VOICE-never.txt` (if you
   have no shell, ask the lead). Fix every ERROR; judge each warning.
2. Read `docs/truth/VOICE.md`. Write for one reader: a buyer on a phone choosing a gift.
3. Rewrite, keeping every fact. Remove:
   - Staging: "not X but Y", one-line closers ("Let that sink in."), "here's the thing",
     deep-sounding sayings, arguing with no one.
   - Rhythm by rule: forced threes, dashes everywhere, every sentence opening the same way.
   - Inflation: pivotal, testament, stands as, meticulous, vibrant, curated, elevate; unnamed
     experts; "nestled", "in the heart of".
   - Formatting by rule: bold on every item, emoji bullets, hashtag stacks (≤ 5 on Instagram).
   - Chat residue: "Great question", "I hope this helps", disclaimers about knowledge limits.
   - Wrong reader: explaining what the reader already knows.
4. Add what people add: specific facts (size in cm, hours of making, which city), plain verbs,
   natural uneven sentence length; end on the last concrete fact or the action.
5. Run prose-lint again. Report in one line what changed.

Never invent numbers, quotes, reviews, stories or urgency to sound real. Never change prices,
dates, delivery promises or policy wording. The goal is the reader, not AI detectors.
