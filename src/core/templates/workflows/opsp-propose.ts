/**
 * OPSP Propose Workflow Template
 *
 * Analyzes explore conversation, classifies operator inputs into
 * driver-specs and ADRs, creates initiative descriptor with milestone plan.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-propose',
    description: 'Create an initiative — analyze conversation to classify inputs into driver-specs and ADRs, then produce an initiative descriptor with a high-level milestone plan.',
    instructions: OPSP_PROPOSE_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspProposeCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Propose',
    description: 'Create an initiative from exploration — classify into driver-specs, ADRs, and milestone plan',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'propose', 'initiative'],
    content: OPSP_PROPOSE_INSTRUCTIONS,
  };
}

const OPSP_PROPOSE_INSTRUCTIONS = `Create an initiative by analyzing the exploration conversation and classifying operator inputs into the proper opensprint artifacts.

**Input**: Optionally specify an initiative name after \`/opsp:propose\` (kebab-case). If omitted, derive one from the conversation context.

---

## Steps

### 0. Where the input comes from

Two paths reach here, and both are valid (\`DEC-034\`):

| Path | What you are given |
|---|---|
| straight from \`/opsp:explore\` | a conversation |
| from \`/opsp:triage\` | an **initiative already on disk** at \`state: exploring\`, holding an objective and a goal, plus the strategy that triage worked out |

**Where an initiative already exists, do not create a second one.** Read it, switch to its worktree
(\`DEC-029\`), and fill in what it is missing — Strategy and Measure. Its Objective and Goal were
written at backlog time and are not yours to rewrite.

\`\`\`bash
opensprint compact board          # the Backlog column lists them
git branch --show-current       # be on opsp/<initiative> before writing
\`\`\`

**You are the formalizer.** Triage did the strategy brainstorming; this step turns it into records.
Where you arrived straight from explore, you do both — but the conversation has already happened
either way, and this step writes rather than thinks.

### 1. Analyze the Conversation

First, orient on what is already recorded — the views, not every record (\`DS-SURROGATE-BUDGET\`):

\`\`\`bash
opensprint compact plan --json
\`\`\`

If \`opensprint compact\` cannot run — an older CLI, or no surrogate yet — fall back to reading
\`opensprint/driver-specs/*.md\` and \`opensprint/ADRs/*.md\`, and skip the view rules below.

**First, decide what there is to load** — the first case that holds wins:

- **No records yet.** Where \`opensprint/driver-specs/\` and \`opensprint/ADRs/\`
  hold no records at all, there are no records yet: nothing to load — say so, and carry on from
  the conversation; the view rules below do not apply.
- **Records that predate hats.** If every section other than \`open-loops\` is \`unsealed\` with no
  \`inputs\` — and the plan lists at least one such section — while it lists records under
  \`unassigned\`, the records predate hats: read every record, as before views existed, and skip
  the views and the rules below for them. Compiling cannot place a record that declares no
  hat, so tell the operator the records need \`hats:\` rather than offering \`/opsp:compact\`.
- **Otherwise**, orient on the views, as follows.

Read \`opensprint/squad/index.md\` (where it does not exist, go by hat), then \`opensprint/squad/product.md\` and
\`opensprint/squad/maintainer.md\` before writing driver-specs, and \`opensprint/squad/dev.md\` and
\`opensprint/squad/devops.md\` before writing ADRs. A new record must neither restate one that exists
nor miss the record it depends on. **Open the full record only for the decision you are about to act
on** — one you will cite in \`depends-on\`, or one you will supersede.

\`index.md\` routes, and \`compact check\` does not cover it: use it to choose a hat, never as the
source of a claim.

The plan lists only the sections that are not fresh; a section it omits is fresh.
An \`open-loops\` section, in any state, is answered by the plan's own \`openLoops\`, which is
always current. **Where it reports any other section**, the view is not enough for it:
- \`stale\` — read the view, then read in full what moved since it was compiled: the records under
  \`added\` and \`modified\`, and the files under \`observedAdded\` and \`observedModified\`. Do not
  rely on a claim citing an id under \`removed\`.
  In a \`measures\` section those files are tests citing records: read only the ones a measure
  cites as its evidence — the plan's own \`openLoops\` is already current for the rest.
- \`unsealed\` — the section was never compiled; often its view file does not exist yet. Read
  that section's \`inputs\` instead.
- \`tampered\` — the view no longer says what was sealed: someone edited it by hand, or deleted
  it. Set that section aside; read its \`inputs\`, and tell the operator.

Records listed under \`unassigned\` declare no hat and appear in no view: read the ones a new
record would depend on or restate.

Then review everything discussed in the explore session (or the operator's description). Identify:

- **External constraints** (things the operator stated as facts about the world) → these become **driver-specs**
  - Product requirements, legal mandates, compliance rules, performance targets, business constraints
  - Key signal: "the client requires...", "we must...", "legally we need...", "the SLA says..."

- **Architectural decisions** (choices the operator made between alternatives) → these become **ADRs**
  - Technology choices, architecture patterns, infrastructure decisions, build-vs-buy
  - Key signal: "we should use X over Y because...", "let's go with...", "I prefer X because..."

- **Scope and milestones** (the work to be done) → these become the **initiative plan**
  - Each milestone should be a coherent unit of work that maps to one opsx change cycle

### 2. Present Classification for Confirmation

Before writing any files, present the classification to the operator:

\`\`\`
## Proposed Initiative: <name>

### Driver Specs (external truth)
- DS-PRICING: Utility-based pricing, charge per invocation
- DS-COMPLIANCE: SOC2 Type II required by Q3

### ADRs (architectural decisions)
- DEC-001: Serverless architecture (depends on DS-PRICING)
  Rationale: utility pricing requires infra cost to scale with usage
- DEC-002: AWS as cloud provider (depends on DEC-001)
  Rationale: team expertise, Lambda maturity

### Milestones
1. Extract auth service from monolith
2. Migrate payment endpoints to Lambda
3. Deprecate monolith routes

Does this look right? I'll create the artifacts on confirmation.
\`\`\`

Wait for operator confirmation. Adjust if they correct anything.

### 3. Create Artifacts

After confirmation, create files in sequence:

**a. Driver Specs** — for each identified external constraint:
- Create \`opensprint/driver-specs/DS-<SEMANTIC-NAME>.md\`
- Use the operator's words faithfully
- **Assign the hat and the role**, and **write the bar** — this is where the bar is written, ex ante

\`\`\`markdown
---
id: DS-<SEMANTIC-NAME>
type: <product|legal|compliance|reliability|architecture|business>
status: active
created: <YYYY-MM-DD>
hats: [<product|maintainer>]
role: <objective|goal|strategy>
---

<the constraint, in the operator's words>

## Measures

- **Primary**: <the one thing that says whether this landed>

### Bar

<the BDD form for this hat — \`DEC-038\`>

product — a user story:
  as a    <persona>
  I want  <goal>
  for     <reason>

maintainer — given / when / then:
  given   <precondition>
  when    <trigger>
  then    <observable outcome>

- **dimension**: <the axis this sits on>
- **chosen**: <where on it, and the scope that applies to>
- **traded for**: <what was given up to sit here>
- **neighbour**: <the position not taken, or \`unrecorded\`>
\`\`\`

**A \`goal\` or a \`bar\` without a populated \`## Measures\` is reported on every compile**
(\`constraint-unmeasurable\`), and so is a record with no \`role\` in a hat that uses them
(\`record-unclassified\`). Writing them here is cheaper than harvesting them back.

**Do not write a measure you cannot state the bar for.** A \`## Measures\` heading with nothing
beneath it counts as absent, deliberately — the shape of an answer without the answer is worse than
the gap, because the gap gets reported.

**Ask the operator; do not invent.** Where they cannot state a bar yet, record
\`- **Primary**: unstated\` and say the loop will keep reporting it. An honest gap beats a
fabricated target, and a bar nobody agreed to is one the attester will measure against.

**b. ADRs** — for each identified architectural decision:
- Create \`opensprint/ADRs/DEC-SEMANTIC-NAME.md\` with YAML frontmatter — a short kebab-case
  phrase in capitals naming what was decided, **never a number** (\`DEC-036\`). Numbers collide
  across worktrees and tell a reader nothing. \`DEC-001\`–\`DEC-044\` keep theirs permanently.
- Include: Question, Operator Decision, Consideration Factors, Rationale, Invalidation Trigger
- Link to parent driver-specs via \`depends-on\`
- Calculate depth (0 if depends only on driver-specs)

**c. Regenerate DECISION-MAP.md** — after creating ADRs

**d. Initiative Descriptor** — create \`opensprint/initiatives/<YYYYMMDD>-<name>.md\`, where the
prefix is today's date with no separators (\`DEC-036\`). The prefix is **presentation
only** — every reader resolves by the \`id:\` below, never by filename, so a file renamed or a date
mistyped still resolves:

\`\`\`markdown
---
id: <initiative-name>
status: active
state: proposed
created: <YYYY-MM-DD>
---

## Description

<what this initiative aims to achieve>

## Driver Specs

- DS-PRICING
- DS-COMPLIANCE

## ADRs

- DEC-001
- DEC-002

## Addresses

<!-- Only when this initiative arose from triaging open loops. Omit otherwise. -->

- constraint-unanswered: DS-BACKWARD-COMPAT
- decision-unguarded: DEC-010

## Milestones

- [ ] extract-auth-service: Extract authentication into standalone service
- [ ] migrate-payment-endpoints: Move payment API to serverless functions
- [ ] deprecate-monolith-routes: Remove legacy endpoints and redirect
\`\`\`

### 4. Summary

Display what was created:
- Count of driver-specs
- Count of ADRs
- Initiative name and milestone count
- Prompt: "Run \`/opsp:apply <name>\` to start executing milestones."

---

### Recording what the initiative closes

If the exploration started from open loops (\`opensprint compact loops\`), list them under
\`## Addresses\` in the descriptor — the loop kind and the record it concerns. Omit the section
entirely when the initiative did not arise from a loop.

It is prose, not frontmatter, and deliberately so. **Nothing marks a loop resolved.** A gap exists
while the harvest reports it and stops existing when it stops reporting it, so the backlog cannot
drift from reality. \`Addresses\` records what the initiative set out to close, not what it did.

---

## Guardrails

- **Classify, don't invent** — Only create driver-specs and ADRs from what the operator actually said
- **Never duplicate an initiative** — where one exists at \`state: exploring\`, fill it in and advance it; do not write a second

## Step 5: Advance the state

\`\`\`bash
opensprint advance <initiative-name> --to proposed
\`\`\`

**Do not edit \`state:\` by hand.** The command refuses an illegal move, names the legal ones, and
regenerates \`BOARD.md\` (\`DEC-STATE-MACHINE\`). Writing the field directly is what left every
initiative in this project stuck at the wrong state — the instruction to set it existed and was
simply never followed.
- **Never rewrite an Objective or Goal** — those were settled at backlog time
- **Operator confirms** — Always present classification before writing files
- **High-level milestones** — Each milestone is a brief description, not a detailed plan. Detail comes from opsx.
- **Use path.join()** — Construct all file paths cross-platform
- **Architect level** — Milestones describe WHAT to achieve, not HOW to implement
`;
