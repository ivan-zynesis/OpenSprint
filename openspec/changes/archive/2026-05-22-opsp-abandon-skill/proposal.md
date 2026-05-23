# Proposal: OPSP Abandon Skill

## Parent Initiative
parallel-universe-reconciliation

## Driver Specs
- DS-PARALLEL-EXEC
- DS-HIGH-IMPACT-OPS

## ADRs Referenced
- DEC-001: universes are git worktrees
- DEC-002: agent reasons, operator confirms
- DEC-003: DFS traversal order
- DEC-004: mandatory planning phase
- DEC-005: abandoned universe archive structure

## Specs Referenced
- reconciliation-citizen-taxonomy
- reconciliation-conflict-manifest
- reconciliation-migration-manifest

## Summary

Implement the `/opsp:abandon` skill and its command file. This skill declares the current universe the winner, migrates compatible citizens from the target (loser) universe, writes the abandoned archive, and removes the loser worktree.

Analogous to a blockchain hard fork where one chain wins: the loser chain stops producing blocks but its history is preserved in the archive.

## Operator Restrictions

This skill is EXCLUSIVELY operator-invocable via `/opsp:abandon`. It MUST NOT be invoked by sub-agents, automated pipelines, or other skills.
