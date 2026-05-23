# Design: OPSP Rebase Skill

## Phases

### Phase 1: Planning (read-only)
1. Identify source worktree from operator argument
2. Load both surrogates
3. DFS classify all citizens per taxonomy spec
4. Produce and display conflict manifest per manifest spec
5. Warn on model requirements
6. Surface wrong-command warning if >50% ADRs conflict
7. Await operator confirmation

### Phase 2: Execution (DFS)
For each initiative in source, for each ADR then each change:
- HIGH-confidence MIGRATE → auto-merge
- Everything else → pause, present to operator, await decision
- Commit initiative on operator approval, skip on operator rejection

### Phase 3: Surrogate Finalization
After DFS completes, regenerate DECISION-MAP.md from merged ADRs.

### Phase 4: Cleanup
Notify operator that source branch is now stale. Offer to remove source worktree (operator confirms).

## Output Files
- `.claude/skills/opensprint-rebase/SKILL.md`
- `.claude/commands/opsp/opsp-rebase.md`
