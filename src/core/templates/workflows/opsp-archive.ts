/**
 * OPSP Archive Workflow Template
 *
 * Compiles architecture.md from driver-specs + ADRs + decision-map,
 * marks initiative as completed.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspArchiveSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-archive',
    description: 'Archive an initiative — compile all active driver-specs, ADRs, and the decision tree into architecture.md, capturing the complete current architectural state.',
    instructions: OPSP_ARCHIVE_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Archive',
    description: 'Archive an initiative — compile architecture.md from current architectural state',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'archive', 'initiative', 'architecture'],
    content: OPSP_ARCHIVE_INSTRUCTIONS,
  };
}

const OPSP_ARCHIVE_INSTRUCTIONS = `Archive a completed initiative by compiling the current architectural state into \`opensprint/architecture.md\`.

**Input**: Specify the initiative name after \`/opsp:archive\` (e.g., \`/opsp:archive migrate-to-serverless\`). If omitted, list active initiatives.

---

## Steps

### 1. Verify Initiative Completion

Read \`opensprint/initiatives/<name>.md\` and check:
- Are all milestones marked as done?
- If not, warn the operator and ask for confirmation to proceed

### 2. Compile the Surrogate

Do not synthesise \`architecture.md\` here. Invoke the compact workflow (\`/opsp:compact\`) and let it compile.

One engine compiles every derived artifact (DEC-014). Archive writing its own version of architecture.md, with its own section list and its own synthesis rules, is how two documents that claim to describe the same system come to disagree.

Compact produces:
- \`opensprint/architecture.md\` — the architectural state
- \`opensprint/squad/*.md\` — the per-hat views
- \`opensprint/squad/.manifest.json\` — the provenance record

Then confirm the compile is sound:

\`\`\`bash
opensprint compact check
\`\`\`

If \`check\` reports anything not fresh, resolve it before continuing — an archive that ships a stale view records an architectural state that was never true.

### 3. Clean Up Worktrees

Remove any remaining worktrees created during the initiative. Change worktrees are normally pruned at merge, but any still present (e.g., from an interrupted run) should be cleaned up now.

\`\`\`bash
git worktree list
\`\`\`

For each opsp or opsx worktree listed that belongs to this initiative:
\`\`\`bash
git worktree remove <path>
\`\`\`

Then prune stale references:
\`\`\`bash
git worktree prune
\`\`\`

If any worktree contains uncommitted changes, pause and present them to the operator before removing. Do NOT silently discard uncommitted work.

After cleanup, remove the initiative worktree itself (it is no longer needed once the initiative branch is merged to main or otherwise resolved):
\`\`\`bash
git worktree remove ../<repo>-opsp-<initiative-name>
\`\`\`

### 4. Mark Initiative Completed

Update the initiative descriptor:
- Set \`status: completed\`
- Add \`completed: <YYYY-MM-DD>\` to frontmatter
- Ensure all opsx change references are listed

### 5. Display Summary

\`\`\`
## Archive Complete

**Initiative:** migrate-to-serverless
**Status:** Completed
**Driver Specs:** 3 active
**ADRs:** 5 active
**OPSX Changes:** 3 completed
**architecture.md:** Updated ✓

The architectural state of the solution has been compiled.
Review opensprint/architecture.md for the complete picture.
\`\`\`

---

## Key Principles

- **Delegate the compile** — architecture.md and the hat views are produced by \`/opsp:compact\`, never synthesised here (DEC-014)
- **Rewrite completely** — compact rewrites with current state rather than appending. The decision records are the version history.
- **Link to sources** — Reference driver-spec and ADR IDs so readers can drill into details
- **Readable by humans** — This is the document you'd hand to a new team member to understand the system
- **Readable by agents** — This is also what the surrogate reads to answer future questions

---

## Guardrails

- **Verify milestones** — Warn if initiative has incomplete milestones
- **Don't compile by hand** — if architecture.md needs regenerating, run compact; never edit it directly
- **Use path.join()** — Construct all file paths cross-platform
- **Preserve ADRs** — Never modify or delete ADRs during archive. They are the permanent trail.
- **Check for uncommitted work** — Before removing any worktree, verify it has no uncommitted changes. Pause if it does.
- **Prune after remove** — Run \`git worktree prune\` after removing worktrees to clean any stale git references.
`;
