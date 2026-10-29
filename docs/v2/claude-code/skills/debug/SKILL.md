---
name: debug
description: Use for any bug, failing test, build error or "it works on my machine" in Tantu Kala. Root cause before any fix; one hypothesis at a time; two failed fixes means stop and report.
---

# Systematic debugging

Credits: obra/superpowers `systematic-debugging` (MIT).

**Rule: no fix without the root cause.**

1. **Investigate:** read the full error; reproduce it reliably; check recent changes
   (`git log -p` on the files); trace the data from input to failure; in multi-part flows
   (site → Apps Script → Sheet) find which part breaks first.
2. **Compare:** find a working example in the repo and list every difference.
3. **Hypothesis:** one cause at a time, test it with the smallest change, verify.
4. **Fix:** a failing test first (`tdd`), then the fix, then the whole suite.
5. Two failed fixes → stop, write what you tried and saw, hand back to the lead.

Never: change several things at once, silence the error, or delete the failing test.
