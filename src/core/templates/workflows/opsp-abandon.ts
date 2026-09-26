/**
 * OPSP Abandon Workflow Template
 *
 * Declare the current universe the winner, migrate compatible citizens from the
 * loser universe, archive the loser, and remove its worktree — hard fork resolution.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspAbandonSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-abandon',
    description:
      'Declare the current universe the winner — migrate compatible citizens from the loser, archive it, and remove its worktree (hard fork resolution).',
    instructions: OPSP_ABANDON_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI and git worktree support.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspAbandonCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Abandon',
    description:
      'Declare the current universe the winner — migrate compatible citizens from the loser, archive it, remove its worktree',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'abandon', 'universe', 'hard-fork', 'reconciliation', 'surrogate'],
    content: OPSP_ABANDON_INSTRUCTIONS,
  };
}

const OPSP_ABANDON_INSTRUCTIONS = `Declare the current (winner) universe victorious in a hard fork. Migrate compatible citizens from the loser universe, write a permanent abandoned archive, and remove the loser worktree.

**Analogy**: a blockchain hard fork where one chain wins. The loser chain stops producing blocks, but its full history is preserved in \`opensprint/abandoned/\`.

**Input**: Specify the loser worktree path or branch name after \`/opsp:abandon\` (e.g., \`/opsp:abandon ../MyRepo-opsp-v1-arch\` or \`/opsp:abandon opsp/v1-arch\`). If omitted, list all \`opsp/*\` branches and let the operator choose.

---

## ⚠ OPERATOR-ONLY SKILL

**This skill MUST NOT be invoked by another agent, sub-task, automated pipeline, or other skill.**
It is exclusively operator-invocable via the \`/opsp:abandon\` command.
This operation permanently removes the loser worktree and modifies the canonical surrogate.

---

## Phase 1: Identify Universes

1. Determine the **winner universe** — the current worktree. Run \`pwd\` and \`git branch --show-current\` to confirm.
2. Determine the **loser universe** from the operator argument.
3. Confirm both before proceeding.

---

## Phase 2: Planning (Read-Only)

**No files are written during this phase.**

1. Load winner and loser surrogates.
2. **DFS classify all loser citizens**:
   - MIGRATE HIGH: present in loser only, purely additive → eligible for auto-migration
   - MIGRATE LOW: present in loser only, content overlaps → escalate
   - CONFLICT: present in both, incompatible → always escalate
   - REDUNDANT: present in both, equivalent → skip
   - SUPERSEDED: loser citizen resolved differently by winner → drop

   **Default to LOW confidence when uncertain. Bias toward escalation.**

3. Display conflict manifest with \`ABANDON\` as operation label.
4. **Await operator confirmation** before proceeding.

---

## Phase 3: Write Snapshot (Before Any Migration)

**Immediately after operator confirmation, before migrating anything:**

Copy the loser's full \`opensprint/\` directory verbatim to:
\`opensprint/abandoned/<loser-branch-slug>/snapshot/\`

Where \`<loser-branch-slug>\` is the loser branch name with \`/\` replaced by \`-\`.

This snapshot preserves the loser's state at the moment of abandonment.

---

## Phase 4: Execution (DFS)

Work through classified loser citizens depth-first, one initiative at a time.

For each initiative in loser:
- For each ADR: auto-migrate MIGRATE HIGH; pause and escalate LOW and CONFLICT; skip REDUNDANT; drop SUPERSEDED
- For each active opsx change: same dispatch
- Record every decision in the migration manifest log

**Pause semantics**: Stop DFS at any LOW/CONFLICT citizen until operator responds.

---

## Phase 5: Write Migration Manifest

After DFS completes, write \`opensprint/abandoned/<loser-branch-slug>/migration-manifest.md\` in the winner worktree.

Include: YAML frontmatter, context paragraph, summary table, per-citizen records (migrated / dropped CONFLICT / dropped SUPERSEDED / skipped REDUNDANT), operator decision log, recovery notes.

---

## Phase 6: Regenerate Surrogate Summary

Regenerate \`opensprint/DECISION-MAP.md\` to reflect any migrated ADRs.
Display migration summary counts.

---

## Phase 7: Operator Confirms Manifest

Display the written manifest and ask for confirmation before removing the loser worktree.

---

## Phase 8: Remove Loser Worktree

Only after manifest confirmed:
1. \`git worktree remove <loser-path>\`
2. Offer to delete loser branch (operator confirms).

If loser has uncommitted code changes beyond surrogate: warn and do NOT remove automatically.

---

## Recompile the Derived Views

Reconciliation changes the record. The compiled artifacts — \`opensprint/architecture.md\` and \`opensprint/squad/*.md\` — derive from it and are now stale.

Compiled output is **regenerated, never merged** (DEC-014). Do not attempt to reconcile two universes' views against each other: they are projections, and merging projections produces a document that matches neither record set.

Once the surrogate is settled, invoke the compact workflow (\`/opsp:compact\`), then confirm:

\`\`\`bash
opensprint compact check
\`\`\`

## Guardrails

- **Snapshot before migration** — write verbatim snapshot BEFORE migrating any citizens
- **Manifest confirmed before worktree removal** — operator reviews manifest first
- **Read-only planning phase** — no writes until operator confirms
- **Bias toward escalation** — LOW confidence always escalates
- **Initiative as unit of commitment** — pause at initiative boundary on unresolved conflicts
- **Never modify loser universe** — all writes go to the winner
- **No automated invocation** — operator-only, no sub-agent calls
- **Recovery notes in manifest** — always include how to reverse if needed
`;
