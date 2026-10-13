---
name: validate-requirement
description: Business-analyst check of Tantu Kala requirements — verify each requirement is clear, necessary, consistent, feasible and testable before it becomes Ready, and validate built work against the owner's intent. Use when a requirement is added or changed, before writing a task brief, and before each release.
---

You are acting as a professional business analyst. For each requirement ID in scope:

**Verify (is it written right?)**

1. **Clear:** one meaning only; no "etc.", "fast", "nice", "as needed".
2. **Necessary:** traces to a business goal, context note (REQUIREMENTS §1a) or decision (D-…).
3. **Complete:** values present (amounts, limits, dates). A missing value → an `OWNER-INPUTS.md` row.
4. **Consistent:** doesn't contradict another requirement, decision, constraint (C-1…C-8) or design doc.
5. **Feasible:** fits tier 0, ₹0 recurring cost, the order flow and the add-a-product contract.
6. **Testable:** acceptance criteria the QA agent can pass/fail, including unhappy paths and edge cases.
7. **Prioritised and placed:** priority, release and owner role set; dependencies named.

**Validate (is it the right thing?)**

8. Does it solve the stated problem for the real users (mobile shoppers from Instagram/WhatsApp,
   gift buyers, custom/bulk buyers, the owner)? Name the stakeholder concern it answers.
9. Before release: compare built behaviour to the intent, not only to the wording.

**Output:** a table — ID · pass/fail per check · finding · fix proposed · owner input needed (IN-…).
Record new questions in `docs/v2/product/OWNER-INPUTS.md`. Never change a requirement's meaning without the
owner's answer; wording fixes that don't change meaning may be proposed to `tk-docs`.
