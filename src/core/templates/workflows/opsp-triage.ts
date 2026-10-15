/**
 * OPSP Triage Workflow Template
 *
 * Pick up a backlog item: advance it, decline it, or send it back.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspTriageSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-triage',
    description:
      'Pick up a backlog item — decide whether to advance, decline or return it, and brainstorm the strategy that makes it formalizable. The thinking half of the propose stage.',
    instructions: OPSP_TRIAGE_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspTriageCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Triage',
    description: 'Pick up a backlog item — advance, decline, or return it',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'triage', 'initiative', 'strategy'],
    content: OPSP_TRIAGE_INSTRUCTIONS,
  };
}

const OPSP_TRIAGE_INSTRUCTIONS = `Pick up a backlog item and decide what happens to it.

**Input**: an initiative name after \`/opsp:triage\`. If omitted, list items at \`state: exploring\`.

---

## Where this sits

\`\`\`
   explore  --think-->  backlog  --persist-->  initiative (O + G)
   TRIAGE   --think-->  propose  --persist-->  + DS · ADRs · milestones (S + M)
\`\`\`

Two think/persist pairs. You are the thinking half of the second one: **strategy brainstorming**,
ending in a decision about whether this becomes work.

\`/opsp:triage\` exists for **explicitness rather than capability** (\`DEC-039\`). \`/opsp:propose\` could
absorb it and would behave acceptably — but a phase that exists in practice and has no name is a
phase nobody reasons about.

## Step 1: Find the item, its worktree, and pick it up

Every backlog item lives on its own branch (\`DEC-029\`), so the board in this checkout cannot see
items filed elsewhere. List every branch's cards — fetch first, so items others pushed are there:

\`\`\`bash
git fetch --prune                          # skip it offline; the board then shows local branches
opensprint compact board --all-branches    # Backlog column, with each card's branch and owner
\`\`\`

It prints and writes nothing. Switch to the item's worktree, and verify with \`pwd\` and
\`git branch --show-current\` before writing anything. Where its branch exists only on the remote,
create the worktree from it:

\`\`\`bash
git worktree add ../<repo>-opsp-<initiative-name> -b opsp/<initiative-name> origin/opsp/<initiative-name>
cd ../<repo>-opsp-<initiative-name>
\`\`\`

If the item has no branch at all — it was written before initiatives lived on branches — create
one from the current checkout.

Then pick it up, so nobody else triages it at the same time:

\`\`\`bash
opensprint claim <initiative-name>         # names you: git's user.name, or --owner <name>
git add opensprint/initiatives/ opensprint/BOARD.md
git commit -m "triage: claim <initiative-name>"
\`\`\`

If the board shows someone else as its owner, ask the operator before taking it over.

**A claim others cannot fetch claims nothing.** Offer to push the branch (\`git push -u origin
opsp/<initiative-name>\`); until it is pushed, nobody else's board shows it as taken.

Load the surrogate before judging anything. A backlog item that looked novel in isolation is
frequently answered already. Load the views, not every record (\`DS-SURROGATE-BUDGET\`):

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
- **Otherwise**, orient on the views, as follows.

Read \`opensprint/squad/index.md\` (where it does not exist, go by hat), \`opensprint/squad/product.md\` and
\`opensprint/squad/maintainer.md\` — the item's objective and goal are product's question, and what
it trades away is maintainer's. Open \`opensprint/squad/dev.md\` or \`opensprint/squad/devops.md\` when
you weigh an approach against what is already built, checked the same way with
\`opensprint compact plan --hat dev --hat devops --json\`.

\`index.md\` routes, and \`compact check\` does not cover it: use it to choose a hat, never as the
source of a claim.

**Open the full record only for the decision you are about to act on** — a decision the approach
would depend on, or one it would invalidate. Every claim in a view cites its record id.

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
the item touches.

Do not compile product or maintainer here — say which views are not fresh and offer \`/opsp:compact\`.

## Step 2: Brainstorm the strategy

The item holds an Objective and a Goal. What it lacks is **how** — and whether that how is worth
doing.

Think about approach, not implementation:

- what are the two or three genuinely different ways to reach this goal?
- what does each cost, and what does each foreclose?
- which existing decisions constrain the choice? Which would it invalidate?
- what would have to be true for this to be the wrong thing to build?

This is architect-level. If you find yourself discussing function names, you have gone too deep —
that is opsx's altitude, reached through \`/opsp:apply\`.

## Step 3: Decide

Three outcomes, and **declining is first-class**:

### Advance

The approach is clear enough to formalize. Say what the strategy is, in a sentence, and hand to
\`/opsp:propose\` — which writes the driver-specs, the ADRs, the milestones and the bar.

### Decline

\`\`\`markdown
state: declined
\`\`\`

…and **record why**, in the initiative. The reason is worth more than the idea:

> Declined 2026-10-11 — the licensing cost of the managed option exceeds the operational saving at
> our volume. Revisit if volume triples or the pricing model changes.

The same proposal returns in six months. One recorded line ends that conversation in a minute.

\`declined\` is terminal but **not permanent** (\`DEC-035\`). Reviving it returns it to \`exploring\`,
keeping its history including the earlier decline.

### Return it

The idea is worth keeping and not yet thought through. Leave it at \`exploring\`, note what is
missing, and say what would need answering before it could be triaged again.

Put the card down, so the board shows it is nobody's again:

\`\`\`bash
opensprint claim <initiative-name> --release
git add opensprint/initiatives/ opensprint/BOARD.md
git commit -m "triage: return <initiative-name>"
\`\`\`

Offer to push it, as you did the claim.

## Step 4: Stop

Whatever you decided, say it plainly and stop. Advancing means handing to \`/opsp:propose\`, not
beginning it.

---

## Guardrails

- **Load the surrogate first.** Most items are partly answered already.
- **Architect altitude.** Approaches and trades, not implementations.
- **Declining is a real outcome**, not a failure to decide. Record why.
- **Never formalize here.** No driver-specs, no ADRs, no milestones — that is \`/opsp:propose\`.
- **Never advance silently.** The operator decides; you recommend.
`;
