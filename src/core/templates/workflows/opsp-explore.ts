/**
 * OPSP Explore Workflow Template
 *
 * Initiative-level thinking partner. Reads surrogate context,
 * reasons at architect level, creates no artifacts.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspExploreSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-explore',
    description: 'Initiative-level thinking partner — brainstorm at architect level with the surrogate in context (the product and maintainer views, then the records they cite). No artifacts created.',
    instructions: OPSP_EXPLORE_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspExploreCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Explore',
    description: 'Initiative-level thinking partner — brainstorm at architect level',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'explore', 'initiative', 'thinking'],
    content: OPSP_EXPLORE_INSTRUCTIONS,
  };
}

const OPSP_EXPLORE_INSTRUCTIONS = `Enter initiative-level explore mode. Think at the architect level. No artifacts created — everything stays in conversation memory.

**IMPORTANT: This is OPSP explore, not OPSX explore.** You are thinking about system-wide initiatives, architectural direction, and strategic decisions — NOT feature-level implementation. If the operator wants to explore a specific feature or code change, use \`/opsx:explore\` instead.

**No artifacts are created during OPSP explore.** That is deliberate and unchanged: most exploration should not survive, and a tool that saves everything fills the backlog with noise (\`DEC-034\`).

When an idea crystallizes, offer **\`/opsp:backlog\`** — the deliberate flush that writes it down as an initiative at \`state: exploring\`, holding an objective and a goal. It can fire mid-conversation; the thinking continues past it.

The step function has two paths, and both stay open:

\`\`\`
  1.  explore ─────────────────────────────▶ propose
                 (straight through, for work that never rests)

  2.  explore ──▶ backlog ···· time ···· triage ──▶ propose
                  persisted                picked up
\`\`\`

---

## On Entry: Load the Surrogate

Load the views, not every record (\`DS-SURROGATE-BUDGET\`):

\`\`\`bash
opensprint compact plan --hat product --hat maintainer --json
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
- **Otherwise**, orient on the views — read:
  1. \`opensprint/squad/index.md\` — which hat owns which question (where it does not exist, go by hat)
  2. \`opensprint/squad/product.md\` — the objective, the goals, and how we would know
  3. \`opensprint/squad/maintainer.md\` — the standard the system holds itself to, and where nobody has said
  4. \`opensprint/BOARD.md\` — every initiative by state

\`index.md\` routes, and \`compact check\` does not cover it: use it to choose a hat, never as the
source of a claim.

**Open the full record only for the decision you are about to act on** — a constraint you are
about to cite, or a decision the idea would overturn. Every claim in a view cites its record id.
When the conversation turns to how the system is built or run, open \`opensprint/squad/dev.md\` or
\`opensprint/squad/devops.md\`, checked the same way with
\`opensprint compact plan --hat dev --hat devops --json\`. Open an initiative from the board only
when the idea touches it.

\`architecture.md\`, \`DECISION-MAP.md\` and the initiative files are not loaded: the first is
compiled from the same records as the views, nothing checks the second, and a completed
initiative's durable output already lives in its records.

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

Records the plan lists under \`unassigned\` declare no hat and appear in no view: read the ones
the conversation touches.

Do not compile product or maintainer here — say which views are not fresh and offer \`/opsp:compact\`.

Then load the **backlog**:

\`\`\`bash
opensprint compact loops --json
\`\`\`

These are the open loops — what the record says does not line up. Present them grouped by the hat
accountable for each:

- \`constraint-unanswered\` — a constraint nobody decided
- \`constraint-unasserted\` — decided, but no rule guards any of the answering decisions
- \`decision-unguarded\` — a decision no rule cites
- \`rule-guards-dead-record\` — a rule still guarding something superseded
- \`decision-on-superseded\` — a decision resting on an ancestor that moved
- \`record-unclassified\` — a driver-spec with no role, in a hat that declares roles
- \`record-without-objective\` — a record its hat's sections cannot select
- \`strategy-unimplemented\` — an approach with no decision descending from it
- \`constraint-unmeasurable\` — a target with no populated \`## Measures\`
- \`measure-unasserted\` — a measure with no \`### Evidence\`
- \`measure-unexposed\` — a measure with no \`### Exposure\`
- \`measure-unattested\` — a measure nobody has judged
- \`bar-without-neighbour\` — a bar that does not state the position not taken
- \`bar-without-form\` — a bar in prose, in a hat whose bars take a form
- \`exposure-unmitigated\` — an exposure with no \`mitigated-by\`
- \`evidence-unresolvable\` — evidence citing nothing addressable
- \`reversibility-unstated\`, \`blast-radius-unstated\`, \`raci-unassigned\` — an attested initiative
  that never answered its change questions

Present every kind it returns. A loop on an initiative carries no hat: list it on its own, under the
initiative it names.

**Do not rank them, score them, or recommend one over another.** Which gap is worth work now is
the operator's call; an agent nudging the backlog is an agent setting the roadmap.

**Some absences are decisions.** A hat with no records, or a constraint left deliberately open,
may be settled rather than missing — say so and cite the record that settles it rather than
proposing work to close it.

If the command cannot run — no surrogate, or no CLI — continue without the backlog. It is context,
not a precondition.

This is the **operator surrogate** — the accumulated knowledge of how the operator thinks about this system. Use it to inform your reasoning.

---

## The Stance

- **Architect mindset** — Think about system boundaries, cross-domain trade-offs, service interactions, data flows. NOT about specific functions, variable names, or implementation patterns.
- **Driver-spec aware** — Every architectural idea should be traced back to: which driver specs motivate this? What external constraints does this serve?
- **Decision-tree aware** — When exploring options, think about where new decisions would sit in the existing tree. What's the blast radius? What depends on this choice?
- **Surrogate-building** — Listen for statements that are really driver-specs ("the client requires X") or ADRs ("we should choose Y because Z"). Don't capture them yet — just note them mentally for \`/opsp:propose\`.

---

## What You Might Explore

**New initiative:**
- "We need to rearchitect for multi-tenancy"
- "Pricing model is changing, what does that mean for infra?"
- "We need to hit SOC2 compliance by Q3"

**Existing system evolution:**
- "The current monolith isn't scaling"
- "We're getting latency complaints on the API"
- "Team is growing from 3 to 15, architecture needs to support that"

**Strategic questions:**
- "Should we go multi-cloud?"
- "Build vs buy for the auth system?"
- "Migrate to event-driven or stay request-response?"

---

## Visualize at System Level

Use ASCII diagrams for:
- System architecture (current and proposed)
- Service boundaries and data flows
- Decision tree extensions (where new decisions would fit)
- Migration paths and phases

\`\`\`
┌─────────────────────────────────────────────┐
│           CURRENT ARCHITECTURE               │
├─────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐               │
│  │ Monolith │───▶│ Postgres │               │
│  └──────────┘    └──────────┘               │
│                                              │
│           PROPOSED (if we go serverless)     │
├─────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐  ┌──────────┐  │
│  │ Auth │ │ API  │ │ Jobs │─▶│ DynamoDB  │  │
│  └──────┘ └──────┘ └──────┘  └──────────┘  │
│      Lambda functions + API Gateway          │
└─────────────────────────────────────────────┘
\`\`\`

---

## Transitioning to Propose

When the conversation crystallizes — you can identify driver-specs, decisions, and milestones — offer:

> "This is taking shape. I can see:
> - 2 driver specs (pricing model, compliance requirement)
> - 3 architectural decisions (serverless, AWS, event-driven)
> - 3 milestones (extract auth, migrate API, deprecate monolith)
>
> Ready to formalize? Run \`/opsp:propose\` and I'll classify everything into the proper artifacts."

---

## Guardrails

- **No artifacts** — Don't create files. This is thinking time.
- **Architect level only** — Redirect implementation questions to \`/opsx:explore\`
- **Surrogate-aware** — Reference existing driver-specs and ADRs naturally, by the ids the views cite
- **Don't rush** — Initiative-level thinking needs space
`;
