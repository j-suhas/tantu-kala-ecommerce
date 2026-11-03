---
name: brainstorm
description: Use before any non-trivial new work for Tantu Kala — a feature, page, campaign, product line, reel series, process change — when the goal isn't settled. Finds out what Suhas actually wants and why, offers 2–3 approaches, and ends with an approved brief. Skip for clear, small requests.
---

# Brainstorm (gate G0)

Credits: adapted from obra/superpowers `brainstorming` (MIT) and EveryInc compound `ce-brainstorm`
(MIT), written for Tantu Kala.

## Size it first
- The request already says everything that matters → just do it, say what you did.
- Touches money (prices, offers, UPI), customer data, security, the brand, or more than a day of
  work → full skill. Otherwise one question at most, then a one-line brief.

## Look before you ask
Read `docs/truth/PRODUCT.md`, `docs/truth/DESIGN.md`, `docs/truth/VOICE.md`, the decisions the
topic touches (Grep `docs/v2/DECISIONS-LOG.md`), and `docs/v2/product/OWNER-INPUTS.md`. Never ask
what the docs already answer; never re-ask an open input — point to its IN-number.

## The conversation (owner-facing, plain words)
1. Echo the request in ≤ 200 words: what, for whom, why, plus anything you found that changes it
   (a decision it conflicts with, a cheaper path, a cost).
2. One question per message — the one whose answer most changes the result — and why you ask.
3. Then 2–3 approaches in a message of their own: what, cost (₹ and effort), risk, your
   recommendation. Suhas picks. For brand-visible or hard-to-undo choices offer a `bakeoff`.
4. Write the result into the task brief (`write-task-brief`) or, for work without a backlog item,
   `work/<task-id>/brief.md` with Goal, For, Chosen approach (+ alternatives in one line each),
   Constraints (decisions quoted with IDs), Open questions, and `Approved:` filled by the lead
   only after Suhas says yes.

## Rules
- Max 3 questions per session (lead duty); no jargon he hasn't used.
- No building during brainstorming, except a spike he agreed to.
- "Just do it" ends the questions: state any big choice in one line and proceed.
