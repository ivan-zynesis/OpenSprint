---
id: DS-PARALLEL-EXEC
type: architecture
status: active
created: 2026-05-22
---

# DS-PARALLEL-EXEC: Parallel Initiative Execution

## Statement

OpenSprint initiatives must support concurrent execution across independent git worktrees. Each worktree carries its own surrogate (`opensprint/`) and evolves independently. No shared mutable state between parallel initiatives during execution.

## Rationale

Serial execution is insufficient for teams running independent workstreams simultaneously — a redesign initiative and a maintenance initiative should not block each other. Git worktree isolation provides universe-level separation without custom storage mechanisms.

## Implications

- Each initiative branch/worktree is a self-contained universe: code + surrogate co-located
- Parallel universes will diverge in ADRs, driver-specs, and architecture.md over time
- Reconciliation (rebase or abandon) is required when universes need to converge or one wins
