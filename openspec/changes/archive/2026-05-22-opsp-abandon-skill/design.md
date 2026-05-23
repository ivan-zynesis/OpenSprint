# Design: OPSP Abandon Skill

## Phases

### Phase 1: Planning (read-only)
Same as rebase: identify universes, load surrogates, DFS classify, display conflict manifest, await confirmation.

### Phase 2: Execution (DFS)
For each initiative in the loser, classify and migrate/drop per taxonomy. Initiative is unit of commitment.

### Phase 3: Write Abandoned Archive
- `opensprint/abandoned/<name>/snapshot/` — verbatim copy of loser's opensprint/ BEFORE any migrations
- `opensprint/abandoned/<name>/migration-manifest.md` — full traversal record per migration-manifest spec

Manifest is written to the WINNER worktree (current). Operator confirms manifest looks correct.

### Phase 4: Cleanup
Remove loser worktree and branch AFTER manifest is confirmed.

## Output Files
- `.claude/skills/opensprint-abandon/SKILL.md`
- `.claude/commands/opsp/opsp-abandon.md`
