/**
 * OPSP Compact Workflow Template
 *
 * Renders the condensed per-hat surrogate views from the record, driving the
 * deterministic engine (`opensprint compact`) rather than reimplementing it.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspCompactSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-compact',
    description: 'Compile the surrogate into per-hat views — condense driver-specs and ADRs into the views an agent reads for orientation, with every claim citing its record.',
    instructions: OPSP_COMPACT_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspCompactCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Compact',
    description: 'Compile the surrogate into per-hat views and architecture.md',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'compact', 'surrogate', 'views'],
    content: OPSP_COMPACT_INSTRUCTIONS,
  };
}

const OPSP_COMPACT_INSTRUCTIONS = `Compile the surrogate into condensed per-hat views under \`opensprint/squad/\`, plus \`opensprint/architecture.md\`.

The records — driver-specs and ADRs — are the source of truth. These views are **derived**. If a view is wrong, the system is wrong, and the fix is to change the record, not the document.

---

## The loop

You drive the engine; you do not reimplement it.

\`\`\`
opensprint compact plan --json   ── what is not fresh, and which records feed it
        │
        ▼
  read those records IN FULL     ── never the previous rendering
        │
        ▼
  render the affected sections
        │
        ▼
opensprint compact seal          ── records the manifest
\`\`\`

### 1. Plan

\`\`\`bash
opensprint compact plan --json
\`\`\`

The output gives, for each section that is not \`fresh\`: its hat, its section name, its state, which record ids were added, removed or modified, and the path of every record feeding it.

**If every section is fresh** — report that and stop. Nothing to do.

**If any section is \`tampered\`** — STOP. Do not render. See *Tampered views* below.

### 2. Read the inputs in full

For each section you are about to render, read **every** record the plan names, in full.

Do not read the existing view and edit it. Do not summarise a summary. The previous rendering is **output**, never input — a view that is produced by editing the last view drifts one small step per compile, and after twenty compiles nobody can say what it derives from.

### 3. Render

Write the affected sections into \`opensprint/squad/<hat>.md\`, and the router into \`opensprint/squad/index.md\`.

### 4. Seal

\`\`\`bash
opensprint compact seal
\`\`\`

Never write \`opensprint/squad/.manifest.json\` yourself. The engine owns it, and a manifest written by hand is a claim nobody checked.

Then confirm:

\`\`\`bash
opensprint compact check
\`\`\`

---

## Citation is not optional

**Every claim carries the record ids it derives from, inline, in the body text.**

\`\`\`
GOOD:  Production runs single-AZ at a 99% bar (\`DEC-062\`), with multi-AZ
       restored for the database (\`DEC-064\`).

BAD:   Production runs single-AZ at a 99% bar.
       ...
       Sources: DEC-062, DEC-064
\`\`\`

The reason is a real failure, not neatness. When one decision ends part of another, a claim built only from the older record states something that stopped being true. Cited inline, a paragraph about availability that names only \`DEC-062\` is **visibly** missing its amendment. Uncited, it is silently wrong.

So: when a record has been amended or partly superseded by another, **cite both**. A claim citing only the superseded record is incomplete.

Citations also make the drill-down affordable. A reader orients on the view and opens the full record only for the decision they are about to act on.

---

## View structure

Each hat view has four sections. The engine tracks them separately, so a new ADR restages \`Decisions\` and leaves \`Constraints\` alone.

\`\`\`markdown
# <hat> — <the question this hat owns>

## Charter
What this hat owns · what it may not trade away · when it escalates

## Constraints
<the hat's driver-specs, condensed, each claim cited>

## Decisions
<the hat's ADRs, condensed, each claim cited>

## Open Loops
<only what the engine reported>
\`\`\`

### Charter

The charter is **derived, not authored**. Draw it from the hat's own records that describe the operating model rather than the system's behaviour — who owns what, what must not be traded away, when something escalates.

If the hat has no such record, **say so** and list it as an open loop. Do not invent a charter. A charter nobody decided is a convention wearing a decision's clothes.

### Open Loops

Report **only** what the plan reported:

- records assigned to no hat
- records declaring a hat outside the registry
- a hat in the registry with no records at all

Do not infer a missing decision or a missing test from a record's content. An invented gap costs someone a triage conversation about nothing. Gaps between decisions and the rules that guard them are a separate mechanism.

### index.md

A router, not a summary. For each hat: the question it owns, the path to its view, and how many records sit behind it.

Hats do not partition the work — most initiatives touch every hat — so the index exists to orient a reader, not to let them skip hats.

---

## architecture.md

Render \`opensprint/architecture.md\` in the same pass, **from the records**, not from the hat views. The views and architecture.md are peers: both are one hop from the record. Compiling one from the other compounds the loss.

Sections: System Overview · Driver Specs · Architectural Decisions · System Structure · Constraints & Non-Negotiables. Same citation rule throughout.

---

## Tampered views

A \`tampered\` section means the records did not move but the view did — someone edited it by hand.

**Stop. Do not render over it.**

Present the affected views and tell the operator plainly: the edit will be lost on the next compile, and a hand edit usually means someone believed the view was wrong. If the view is wrong, **the system is wrong** — so the path is \`/opsp:explore\`, which feeds \`/opsp:propose\`, which changes the record. Then compact recompiles and the correction is permanent instead of being overwritten.

---

## Guardrails

- **Never write a record.** Compact does not create, modify or delete anything under \`opensprint/driver-specs/\` or \`opensprint/ADRs/\`, and does not touch \`opensprint/DECISION-MAP.md\`. Changes to the record go through \`/opsp:driver\`, \`/opsp:decide\` or an initiative.
- **Never write the manifest.** \`opensprint compact seal\` owns it.
- **Rebuild, don't patch.** A stale section is re-rendered from its full inputs.
- **Cite everything.** A claim with no record id is a claim nobody can check.
- **Don't invent.** Condense what the records say. Where they say nothing, say nothing — and list it as an open loop if the engine reported it.
- **Stop on tampered.** Overwriting a hand edit destroys the only evidence of what someone thought was wrong.
- **Use path.join()** for every path you construct.
`;
