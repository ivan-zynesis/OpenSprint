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

## Three authorities, and only one licenses the present tense

A view describes **the system**, citing records where they explain it. A claim can rest on three
different things, and a reader has to be able to tell which:

| Authority | Cited by | Says | Weakness |
|---|---|---|---|
| **decided** | a record id | it binds — departing from it is a defect | **may not be true yet** |
| **observed** | a path | it is what the code does today | may be an accident |
| **attested** | evidence · date · attester | asserted true, with an artifact behind it | ages |

\`\`\`
DECIDED:    Reconciliation is operator-invocable only (\`DS-HIGH-IMPACT-OPS\`).
OBSERVED:   The API runs on Node 22 and Fastify (\`apps/api/package.json\`).
ATTESTED:   No credential reaches a log; the scan has failed the build on every
            attempt since (\`DS-SECRETS\`, attested 2026-10-09 by ivan).
\`\`\`

**Only \`attested\` licenses an unqualified present-tense claim about a property of the system.**

The plan tells you which: each staged record carries an \`authority\`. A record is \`attested\` only
where its measure carries both an attestation date and evidence — a verdict with nothing asserting
it is an opinion, and the harvest reports it as \`measure-unasserted\`.

Four rules follow.

**A decided-but-unattested claim is written as a decision, not as a fact.** Write *"reconciliation
is operator-invocable only (\`DS-HIGH-IMPACT-OPS\`)"*, never *"reconciliation cannot be automated"*.
The first is true; the second is a claim about the running system that nothing has checked.

This is the failure this contract exists to prevent. A compiled view once stated *"Operator-only
reconciliation — absolute, not a preference"* under **Constraints & Non-Negotiables** while another
view, compiled in the same pass from the same records, admitted the guardrail was instruction text
no rule read. Neither was wrong; there was no third category.

**An observation no record explains still stands.** Write it, cite its path, and do not invent a
rationale. Something being undocumented means it was never made explicit — that is reportable, not
wrong.

**Never present an observation as though a record established it.** A claim citing a file is a
claim about what is; a claim citing a record is a claim about what was decided. Blurring them is
how a view starts asserting authority nobody granted.

**If an observation appears to contradict a record, surface the disagreement.** Do not choose
between them and do not quietly prefer either. Resolving it is a rule's job, not compaction's —
a failing rule is how an implementation and a decision disagreeing becomes visible.

---

## View structure

Each hat's sections come from the plan — **do not assume the four generic ones.** Different
accountabilities produce different *kinds* of knowledge, not the same kind about different
subjects, so each hat has its own shape.

**None of them enumerate records.** A section earns its place by conveying the domain, not by
giving every record somewhere to live. A record that does not shape the picture simply does not
appear, and that is not a defect (\`DS-BIG-PICTURE\`).

### product — a chain, not a list

\`objective · goals · strategies · measures · open-loops\`

OGSM, and the causality is the point: there is a long-term **objective**, therefore short-term
**goals** that reach it, therefore **strategies** that accomplish them, and **measures** that say
whether the goals landed.

- **objective** — the long-term direction. One record, usually. Qualitative by nature.
- **goals** — what must be true to get there, each stated so you could tell whether it is.
- **strategies** — how the goals are pursued.
- **measures** — for each goal: what measures it, and what actually asserts that measure. This is
  the QA bridge rendered — the place where "we said this matters" meets "something checks it". A
  goal with no measure is **named**, not omitted.

There is **no charter and no constraints section**. What a charter would have said is carried by
the objective; a constraint is either a goal, or a strategy describing how it is worked around.

### maintainer — seven inherited objectives, and what each costs

\`posture · security & access · isolation & confidentiality · privacy, retention & legal ·
integrity & correctness · change & quality · availability & continuity · cost & budget ·
open-loops\`

This hat is the **technical product manager**: the same OGSM as product, with one difference that
carries everything — its objectives are **inherited, not discovered**. Every software project
worries about the same seven things, which is why the accountability spun off from product.

**posture comes first, above the grid.** It is the hat's own statement of what standard the
project holds itself to at all, which is upstream of every objective rather than one of them. A
per-measure posture is a deviation from it.

Each objective then carries a **goal**, a **strategy**, and a **measure**:

- **goal** — the outcome committed to in that domain, stated so you could tell whether it landed
- **strategy** — the position taken. **High level only.**
- **measure** — the benchmark, standard or clause, with its anatomy beneath it

**An objective with nothing recorded still renders.** An empty row is the most useful cell in the
view — it says nobody has stated what this system does about that concern. Never omit one.

#### The strategy altitude

A strategy states a **position**, never a **mechanism**. Domain know-how belongs to \`dev\` and
\`devops\`, and the audience for this view is senior management.

So a strategy cell renders the position **plus a citation** to the \`dev\`/\`devops\` decisions that
implement it — and never describes what they chose:

\`\`\`
credentials never live in the repository          <- the position
  → DEC-SECRET-STORE (dev)                        <- where the mechanism lives
\`\`\`

This needs no new rule to enforce. A mechanism detail belongs to a decision this hat does not own,
so there is **no record you may cite for it** — and every claim must cite one. If you cannot write
the sentence with a citation, it does not belong in this view.

Where a strategy has nothing to cite, **say so**. Do not invent an implementation; the harvest
reports the same gap as \`strategy-unimplemented\`.

#### The strategy sub-framework — SWOT-like, deliberately not SWOT

Where a strategy cites decisions, render four parts beneath the position (\`DEC-037\`). Each is
**compiled from the ADR**, never authored here:

| Part | Means here | Read it from |
|---|---|---|
| **Strength** | why this choice | the ✓ cells of the chosen column in \`## Consideration Factors\` |
| **Weakness** | the trade-off it carries | the ✗ cells of the chosen column |
| **Opportunity** | **the alternatives corresponding to the choice made** | the other columns of \`## Consideration Factors\` |
| **Threat** | the risk, and what would mitigate it | \`## Invalidation Trigger\` |

\`Opportunity\` is a **deliberate redefinition**. Standard SWOT means external upside; here it means
the alternatives that were weighed. Stated so it does not read as a misunderstanding.

\`\`\`
credentials never live in the repository
  → DEC-SECRET-STORE (dev)
    strength:    rotation without a deploy; no secret in a diff, ever
    weakness:    a hard runtime dependency on the store being reachable
    opportunity: sealed secrets in-repo, and a KMS-encrypted env file
    threat:      a store outage becomes a deploy outage — mitigated by a cached lease
\`\`\`

**Four parts, not four paragraphs.** Each is one line. If a part has no source in the ADR, write
\`unrecorded\` — the compile reports what the record says, and a part invented to fill the shape is
worse than an empty one. Never open the implementation to work out what the weakness must be.

#### The measure anatomy

A measure has four parts. The **bar** is written when the work is proposed; **posture**,
**evidence** and **exposure** are written when it is attested. Render only what the record carries:

\`\`\`
bar:        dimension — the axis, and why it is an axis
            chosen    — the point, and the scope it applies to
            traded for— what was given up to sit here
            neighbour — what the next point along would cost
posture:    was the bar met — or, where no bar is set, the honest position
evidence:   what asserts it
exposure:   what remains at risk, and what is planned to close it
\`\`\`

#### The bar sub-framework — BDD, split by hat

The bar's **statement** takes one of two forms, chosen by hat (\`DEC-038\`). The anatomy above says
where the bar *sits*; the form says how CI tells you it is still there.

**product** — a user story, because the persona and the reason are the point:

\`\`\`
as a    returning customer
I want  my cart to survive a session expiry
for     the checkout I abandoned on mobile to still be there on desktop
\`\`\`

**maintainer** — given / when / then, because the bar must be assessable from pipeline output:

\`\`\`
given  a credential is committed
when   CI runs
then   the build fails
\`\`\`

A maintainer bar written as a user story is an awkward fiction — *"as a maintainer, I want
credentials not to be committed"* says less than the three lines above, and only those tell you
what to point a pipeline at. **A bar in given/when/then form is already a test specification**,
which is what makes \`DS-CI-ATTESTATION\` mechanically possible rather than aspirational: the gap
between stating a bar and producing evidence for it is as small as it can be.

\`dev\` and \`devops\` declare no form. They describe a system; they do not commit to a bar.

**Posture, evidence and exposure stay prose.** Those are judgements and references, and imposing
structure on them produces filled-in templates rather than thought. The structure is spent where it
buys something.

A bar stated without its trade reads like a law of nature when it was a purchase somebody made,
and the receipt is what a maintainer picking up the hat actually needs. **If the records do not
say what it cost, say the trade is unrecorded** — do not invent it. The same applies to a measure
with no posture: an unattested measure is **decided, not true**, and must not be written in the
present tense.

**Cost is an axis of every bar, not a section.** A cost section would describe spend; a cost
dimension describes the decision. \`cost & budget\` as an objective is what the system costs to run
and maintain — the business model belongs to product.

### dev and devops — describe the system

\`tech-stack · runtime-topology · entity-schema · open-loops\`
\`infra-architecture · gitops · open-loops\`

These describe **what the system is**, citing decisions where they explain a choice. A list of
sixteen condensed ADRs tells a reader nothing about what was built.

- **tech-stack** — what it is built with, observed from the project's manifests. Cite the decision
  behind a choice where one exists, the path where it does not.
- **runtime-topology** — how the parts run and talk to each other. Usually clearer drawn.
- **entity-schema** — the durable data model and its relationships. Say so plainly if the project
  has no persistent data, rather than inventing a section.
- **infra-architecture** — what is provisioned and how it fits together.
- **gitops** — the pipelines, what triggers each, which environments they reach.

The dev/devops split serves **reading, not ownership**. In a repository holding application code
and IaC together, a decision is frequently both — it declares both hats and appears in both views.
The boundary exists so an agent working on application code need not load pipeline context.

### open-loops — every hat has one

Report **only** what the plan reported. The harvest supplies eleven kinds:

| Kind | Means |
|---|---|
| \`constraint-unanswered\` | a constraint no decision answers |
| \`constraint-unasserted\` | answered, but no rule guards any answering decision |
| \`constraint-unmeasurable\` | a target with no populated \`## Measures\` |
| \`decision-unguarded\` | a decision no rule cites |
| \`rule-guards-dead-record\` | a rule still guarding something superseded |
| \`decision-on-superseded\` | a decision resting on an ancestor that moved |
| \`record-unclassified\` | a driver-spec with no role, in a hat that declares roles |
| \`measure-unasserted\` | a measure with no \`### Evidence\` — an aspiration |
| \`measure-unexposed\` | a measure with no \`### Exposure\` |
| \`bar-without-neighbour\` | a bar that does not state the position not taken |
| \`record-without-objective\` | a record its hat's sections cannot select |
| \`strategy-unimplemented\` | an approach with no decision descending from it |
| \`bar-without-form\` | a bar in prose, in a hat whose bars take a form |
| \`evidence-unresolvable\` | evidence citing nothing addressable, or a path not in the tree |

**Do not infer a missing decision or a missing test from a record's content.** An invented gap
costs someone a triage conversation about nothing, and the backlog is only useful while everything
in it is real (\`DEC-007\`).

**Some absences are decisions.** A hat with no records may be settled rather than missing — cite
the record that settles it rather than reporting a gap.

### a hat with no defined shape

A project's own hat — a \`designer\`, say — falls back to
\`charter · constraints · decisions · open-loops\`.

The **charter** there is *derived, not authored*. Draw it from the hat's own records that describe
the operating model — who owns what, what must not be traded away, when something escalates. If
the hat has no such record, **say so** and list it as an open loop. Do not invent a charter: one
nobody decided is a convention wearing a decision's clothes.

## Diagrams

The plan reports the repository's existing habit. **Follow it.**

| Detected | Do |
|---|---|
| \`ascii\` | Use ASCII |
| \`mermaid\` | Use mermaid |
| \`mixed\` | **Ask the operator.** Somebody tried mermaid once; that is not a habit. |

ASCII is the default where nothing is detected, because it survives a terminal, a diff, and an
agent's context with no renderer at all.

Judge **per diagram**, not per repository: a three-service topology is fine in ASCII, a
twenty-table schema is not. If you depart from the repository's habit for one diagram, say why.

And be careful with them. A drifting paragraph is vaguely wrong; **a drifting diagram is
confidently wrong**, and it is the artifact people trust most.

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
