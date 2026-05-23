# Proposal: OPSP Rebase Skill

## Parent Initiative
parallel-universe-reconciliation

## Driver Specs
- DS-PARALLEL-EXEC
- DS-HIGH-IMPACT-OPS

## ADRs Referenced
- DEC-001: universes are git worktrees
- DEC-002: agent reasons, operator confirms (high-confidence-only auto-accept)
- DEC-003: DFS traversal order
- DEC-004: mandatory planning phase
- DEC-005: abandoned universe archive structure (referenced for contrast)

## Specs Referenced
- reconciliation-citizen-taxonomy
- reconciliation-conflict-manifest

## Summary

Implement the `/opsp:rebase` skill and its corresponding command file. This skill brings the work of a source universe (git worktree/branch) into the current target universe, reconciling their surrogates so both bodies of work survive in a single unified timeline.

Analogous to a git soft fork resolving into a consensus chain: source work is absorbed, source branch becomes stale and can be pruned.

## Operator Restrictions

This skill is EXCLUSIVELY operator-invocable via `/opsp:rebase`. It MUST NOT be invoked by sub-agents, automated pipelines, or other skills.
