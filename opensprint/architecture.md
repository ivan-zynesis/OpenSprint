# Architecture

## System Overview

OpenSprint is an AI-native engineering harness for sprint and milestone orchestration. Its core premise is that AI agents should be able to execute multi-milestone software initiatives autonomously, guided by a persistent "surrogate" — a set of driver-specs, architectural decisions, and architectural state that accumulates knowledge about the system over time and answers agent questions without requiring operator involvement at every step.

A key capability introduced by the `parallel-universe-reconciliation` initiative is the ability to run multiple initiatives concurrently. Each initiative operates in its own git worktree, which carries its own independent copy of the surrogate. When two parallel initiatives need to converge — or when one wins and the other must be abandoned — the `/opsp:rebase` and `/opsp:abandon` skills orchestrate the reconciliation.

## Driver Specs

### DS-PARALLEL-EXEC: Parallel Initiative Execution

OpenSprint must support concurrent initiative execution across independent git worktrees. Serial execution is insufficient for teams running independent workstreams simultaneously. A redesign initiative and a maintenance initiative should not block each other.

Each initiative branch/worktree is a fully self-contained universe: the codebase and the surrogate (`opensprint/`) co-evolve together. Parallel universes diverge in ADRs, driver-specs, and architecture.md over time. Reconciliation (via rebase or abandon) is required when universes need to converge or when one wins outright.

### DS-HIGH-IMPACT-OPS: High-Impact Operation Safety

Universe reconciliation operations are high-impact and difficult to reverse. A corrupted surrogate degrades every downstream agent operation that depends on it — the blast radius is unbounded. As a result, reconciliation operations must be exclusively operator-invocable; no automated pipeline, sub-agent, or other skill may invoke them programmatically. The most capable available model with extended thinking is recommended, and a mandatory planning phase with operator confirmation gates every execution.

## Architectural Decisions

### Universes as Git Worktrees (DEC-001)

The central decision is that a "universe" is simply a git worktree. The `opensprint/` surrogate directory lives in its branch as-is, travels with the code, and diverges naturally as commits accumulate. No special universe registry, storage layer, or synchronization daemon is introduced.

This exploits git's existing worktree isolation model: `git worktree add` produces a fully independent directory tree, and `git diff`, `git log`, and merge tooling apply to surrogate files just as they do to source files. The surrogate is versioned, branched, and merged through git — no new abstraction is needed.

### Conflict Resolution: Agent Reasons, Operator Confirms (DEC-002)

When two universes diverge in their surrogates, the agent reasons through conflicts but auto-accepts only under two narrow conditions: the change is purely additive (one universe has content the other lacks, with no semantic overlap), or the content is identical on both sides (trivially redundant). Everything else escalates to the operator.

This asymmetry is intentional. A false escalation costs one operator confirmation prompt. A false auto-accept risks a corrupted surrogate. Two ADRs can differ by a single sentence but represent fundamentally incompatible worldviews — semantic conflicts cannot be resolved by line-diffing alone.

### DFS Traversal: Initiative → ADRs → Active Changes (DEC-003)

Citizens (surrogate artifacts eligible for reconciliation: driver-specs, ADRs, initiative descriptors, active opsx changes) are evaluated depth-first. For each initiative in the source universe, all ADRs referenced by or created during that initiative are evaluated first, then all active opsx changes belonging to that initiative. The initiative is the unit of commitment: if any inner node produces an unresolved conflict, the entire initiative pauses for operator judgment before the DFS advances to the next initiative.

This ordering ensures dependency coherence (changes evaluated after the ADRs they depend on), atomic commitment (no partial initiative migrations), and manageable operator cognitive load (prompts grouped at initiative boundaries, not scattered across individual inner nodes).

Each citizen is classified as one of four states:

| Class | Meaning |
|---|---|
| MIGRATE | Compatible, adds value to target — auto-migrate at HIGH confidence, escalate at LOW |
| CONFLICT | Contradicts target decisions — always escalate |
| REDUNDANT | Target already has equivalent — skip |
| SUPERSEDED | Target resolved this differently — drop, record in manifest |

### Mandatory Planning Phase (DEC-004)

Both `/opsp:rebase` and `/opsp:abandon` open with a read-only planning pass before touching any files. The agent loads both surrogates, classifies all citizens per the DEC-003 taxonomy, and produces a conflict manifest showing counts by category and detail on any CONFLICT or LOW-confidence citizens. The planning phase also warns on model requirements and surfaces a wrong-command recommendation if the ADR conflict rate is high (suggesting the operator chose rebase when abandon is more appropriate). Execution begins only after explicit operator confirmation.

### Abandoned Universe Archive Structure (DEC-005)

When `/opsp:abandon` completes, the loser universe is preserved at `opensprint/abandoned/{name}/`. The archive contains two things: a verbatim snapshot of the loser's `opensprint/` directory captured *before* any migrations occurred, and a `migration-manifest.md` recording the complete traversal — every citizen evaluated, its classification, operator decisions at each escalation point, and recovery notes. The loser's worktree and branch are removed only after the operator confirms the manifest is correct.

## System Structure

The parallel universe reconciliation system consists of:

```
┌─────────────────────────────────────────────────────────────┐
│                    OPERATOR INVOKES                          │
│                                                             │
│   /opsp:rebase <source>          /opsp:abandon <loser>      │
│        │                               │                    │
│        ▼                               ▼                    │
│  ┌──────────────┐             ┌──────────────────┐          │
│  │ opensprint-  │             │  opensprint-     │          │
│  │   rebase     │             │    abandon       │          │
│  │   SKILL.md   │             │    SKILL.md      │          │
│  └──────┬───────┘             └────────┬─────────┘          │
│         │                              │                    │
│         └──────────┬───────────────────┘                    │
│                    ▼                                        │
│           ┌─────────────────┐                              │
│           │  Planning Phase │  (read-only, no writes)      │
│           │  Conflict       │                              │
│           │  Manifest       │                              │
│           └────────┬────────┘                              │
│                    │ operator confirms                      │
│                    ▼                                        │
│           ┌─────────────────┐                              │
│           │  DFS Execution  │  (DEC-003 traversal)         │
│           │  initiative     │                              │
│           │   → ADRs        │  HIGH confidence → auto      │
│           │   → changes     │  LOW/CONFLICT → escalate     │
│           └────────┬────────┘                              │
│                    │                                        │
│          ┌─────────┴──────────┐                            │
│          ▼                    ▼                            │
│   ┌─────────────┐    ┌──────────────────┐                  │
│   │  Surrogate  │    │ opensprint/      │                  │
│   │  Merged     │    │ abandoned/{name}/│                  │
│   │  (rebase)   │    │  snapshot/       │                  │
│   └─────────────┘    │  manifest.md     │                  │
│                      └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

**Skills and commands:**
- `.claude/skills/opensprint-rebase/SKILL.md` — full rebase workflow instructions
- `.claude/skills/opensprint-abandon/SKILL.md` — full abandon workflow instructions
- `.claude/commands/opsp/opsp-rebase.md` — `/opsp:rebase` command entry point
- `.claude/commands/opsp/opsp-abandon.md` — `/opsp:abandon` command entry point

**Source templates** (compiled into skills at `opensprint init` time):
- `src/core/templates/workflows/opsp-rebase.ts`
- `src/core/templates/workflows/opsp-abandon.ts`
- Both registered in `OPSP_WORKFLOW_IDS` (total: 13 workflows)

**Reconciliation specs** (shared vocabulary for both skills):
- `openspec/specs/reconciliation-citizen-taxonomy/spec.md` — citizen classification rules
- `openspec/specs/reconciliation-conflict-manifest/spec.md` — planning phase display format
- `openspec/specs/reconciliation-migration-manifest/spec.md` — abandoned archive file format

## Constraints & Non-Negotiables

**Operator-only invocation** (DS-HIGH-IMPACT-OPS): `/opsp:rebase` and `/opsp:abandon` must never be invoked by sub-agents, automated pipelines, or other skills. This is an absolute constraint, not a preference. The surrogate is the agent's source of truth; a corrupted surrogate silently degrades all future agent decisions.

**Planning phase is mandatory** (DEC-004): No reconciliation operation may begin writing files without first completing a read-only planning pass and receiving explicit operator confirmation. There is no fast-path that skips this gate.

**Bias toward escalation** (DEC-002): The default conflict resolution stance is conservative. Only purely additive, HIGH-confidence changes are auto-accepted. All ambiguity escalates. If the escalation rate proves too high in practice, a confidence-scoring rubric may be introduced — but the default must remain conservative.

**Snapshot before migration** (DEC-005): During `/opsp:abandon`, the loser's full `opensprint/` must be captured verbatim before any migrations occur. The snapshot is the recovery path if the wrong universe was abandoned.

**Manifest confirmed before worktree removal** (DEC-005): The loser worktree and branch are not removed until the operator has reviewed and confirmed the migration manifest. Removal is the last step, not an intermediate one.
