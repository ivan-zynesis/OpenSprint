## 1. Update opsp-apply Checkpoint Options

- [x] 1.1 Update `src/core/templates/workflows/opsp-apply.ts` Phase 2d per-change checkpoint — replace current options with: "Approve and continue" (default), "Raise change request", "Switch review mode", "Stop here (resume later)"
- [x] 1.2 Update Phase 3 milestone checkpoint — same option replacement as 1.1
- [x] 1.3 Add approval logging instructions — when operator approves, agent logs approval with optional note in initiative descriptor

## 2. Add Change Request Flow to opsp-apply Template

- [x] 2.1 Add "Raise change request" handling — present sub-path options: "I know what needs to change" (direct propose) or "I need to explore this first" (explore mode)
- [x] 2.2 Add direct propose path — agent asks operator to describe the fix, delegates to `/opsx:propose` inline, includes surrogate artifact updates in the corrective change
- [x] 2.3 Add explore-first path — agent enters `/opsx:explore` inline with full surrogate context, after exploration concludes either return to approve (no changes) or proceed to `/opsx:propose` (changes needed)
- [x] 2.4 Add surrogate reload after corrective change — after corrective opsx change is archived, re-read all surrogate artifacts and return to checkpoint

## 3. Tests

- [x] 3.1 Verify updated opsp-apply instructions contain "Approve and continue" and "Raise change request" checkpoint options
- [x] 3.2 Verify opsp-apply instructions contain "I know what needs to change" and "I need to explore this first" sub-paths
- [x] 3.3 Verify opsp-apply instructions contain surrogate reload after corrective change
- [x] 3.4 Run full test suite to verify no regressions
