---
name: bakeoff
description: Use for big Tantu Kala decisions — hard to undo, brand-visible, money, or more than a day of work — or when Suhas asks for options. 2–3 independent alternatives with no shared context, an independent judge, and one comparison table for Suhas to decide.
---

# Bakeoff

Credits: EveryInc compound `ce-bakeoff` and `ce-pov` (MIT); BMAD party mode (MIT).

1. **Frame (lead):** goal, hard constraints (tier 0, ₹0, mobile-first, decisions by ID), criteria
   with weights, artifact level (approach brief, sketch, mockup — not production code). Unknowns
   stay unknowns in the brief.
2. **Candidates:** three fresh agents (one recovery launch allowed), same brief, a different
   stance each — e.g. *cheapest that works*, *best customer experience*, *easiest to change
   later*. No candidate sees another's work. Default model; the right role agent for the medium
   (tk-design for visuals, tk-architect for systems, tk-analyst for business).
3. **Judge:** a fresh agent (tk-architect or tk-reviewer; Opus allowed) scores each against the
   criteria. **A hard-constraint violation can't be outweighed by other scores.** If candidates
   converged, compare mechanisms, not labels.
4. **Lead** compares too, reconciles disagreements with evidence (not votes), and shows Suhas:

| Criterion (weight) | A | B | C |
| --- | --- | --- | --- |
Recommended: … because … · Worth keeping from the others: … · Still unknown: …

5. Suhas decides; the lead records it in the decisions log with one line per rejected option.

Budget: once per decision; skip when a quick spike would settle it.
