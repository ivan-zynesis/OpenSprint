/**
 * OPSP Rebase Workflow Template
 *
 * Bring a source universe's surrogate work into the current target universe
 * via DFS citizen reconciliation — soft fork consensus resolution.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspRebaseSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-rebase',
    description:
      'Bring a source universe\'s surrogate work into the current target universe — soft fork consensus resolution via DFS citizen reconciliation.',
    instructions: OPSP_REBASE_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI and git worktree support.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspRebaseCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Rebase',
    description:
      'Bring a source universe\'s work into the current universe — soft fork consensus resolution via DFS citizen reconciliation',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'rebase', 'universe', 'reconciliation', 'surrogate'],
    content: OPSP_REBASE_INSTRUCTIONS,
  };
}

const OPSP_REBASE_INSTRUCTIONS = `Reconcile two parallel initiative universes by bringing the source universe's work into the current (target) universe. Analogous to a git rebase: both bodies of work survive in a single unified timeline. The source branch becomes stale after completion.

**Input**: Specify the source worktree path or branch name after \`/opsp:rebase\` (e.g., \`/opsp:rebase ../MyRepo-opsp-feature-x\` or \`/opsp:rebase opsp/feature-x\`). If omitted, list all \`opsp/*\` branches and let the operator choose.

---

## ⚠ OPERATOR-ONLY SKILL

**This skill MUST NOT be invoked by another agent, sub-task, automated pipeline, or other skill.**
It is exclusively operator-invocable via the \`/opsp:rebase\` command.
Violation of this guardrail risks corrupting the canonical surrogate with unbounded downstream blast radius.

---

## Phase 1: Identify Universes

1. Determine the **target universe** — this is the current worktree (run \`pwd\` and \`git branch --show-current\` to confirm).
2. Determine the **source universe** from the operator argument:
   - If a worktree path: verify it exists and is a git worktree (\`git worktree list\`)
   - If a branch name: resolve to its worktree path, or check it out to a temp worktree if no worktree exists
3. Confirm both universe paths before proceeding.

---

## Phase 2: Planning (Read-Only)

**No files are written during this phase.**

1. Load target surrogate (\`opensprint/driver-specs/\`, \`opensprint/ADRs/\`, \`opensprint/initiatives/\`, active opsx changes).
2. Load source surrogate (same paths under source root).
3. **DFS classify all citizens** per the reconciliation-citizen-taxonomy spec:
   - MIGRATE HIGH: present in source only, purely additive → eligible for auto-accept
   - MIGRATE LOW: present in source only, content overlaps with target → escalate
   - CONFLICT: present in both, semantically incompatible → always escalate
   - REDUNDANT: present in both, semantically equivalent → skip
   - SUPERSEDED: source citizen resolved differently by target → drop

   **Default to LOW confidence when uncertain. Bias toward escalation.**

4. Display the conflict manifest (counts table + detail for CONFLICT and LOW citizens).
5. **Wrong-command guard**: if >50% ADRs are CONFLICT, warn operator to consider \`/opsp:abandon\` instead.
6. **Await operator confirmation** before proceeding.

---

## Phase 3: Execution (DFS)

Work through classified citizens depth-first, one initiative at a time.

For each initiative in source:
- For each ADR: auto-accept MIGRATE HIGH; pause and escalate MIGRATE LOW and CONFLICT; skip REDUNDANT; drop SUPERSEDED
- For each active opsx change: same dispatch
- Commit or skip the initiative as a whole

**Pause semantics**: Stop DFS at any LOW/CONFLICT citizen until operator responds. Never auto-resolve anything marked LOW or CONFLICT.

---

## Phase 4: Surrogate Finalization

After DFS completes:
1. Regenerate \`opensprint/DECISION-MAP.md\` in target to reflect any new ADRs.
2. Display migration summary (migrated / skipped / dropped / conflicts resolved counts).

---

## Phase 5: Cleanup

Notify operator the source branch is stale. Offer to remove source worktree (operator confirms).
If source has uncommitted code changes beyond the surrogate: warn and do NOT remove automatically.

---

## Recompile the Derived Views

Reconciliation changes the record. The compiled artifacts — \`opensprint/architecture.md\` and \`opensprint/squad/*.md\` — derive from it and are now stale.

Compiled output is **regenerated, never merged** (DEC-014). Do not attempt to reconcile two universes' views against each other: they are projections, and merging projections produces a document that matches neither record set.

Once the surrogate is settled, invoke the compact workflow (\`/opsp:compact\`), then confirm:

\`\`\`bash
opensprint compact check
\`\`\`

## Guardrails

- **Read-only planning phase** — no writes until operator confirms
- **Bias toward escalation** — LOW confidence always escalates; never auto-accept ambiguous content
- **One initiative at a time** — complete (or skip) each initiative before advancing DFS
- **Never modify source universe** — all writes go to the target
- **Wrong-command warning** — surface \`/opsp:abandon\` recommendation if ADR conflict rate is high
- **No automated invocation** — operator-only, no sub-agent calls
`;
