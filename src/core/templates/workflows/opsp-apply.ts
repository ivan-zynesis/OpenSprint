/**
 * OPSP Apply Workflow Template
 *
 * Orchestrates multiple opsx cycles per milestone, with surrogate-based
 * question resolution and operator escalation.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspApplySkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-apply',
    description: 'Execute an initiative — orchestrate opsx cycles for each milestone, auto-resolve questions via surrogate (the dev and devops views, then the records they cite), escalate to operator only when surrogate cannot answer.',
    instructions: OPSP_APPLY_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Apply',
    description: 'Execute an initiative — orchestrate opsx cycles with surrogate-based resolution',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'apply', 'initiative', 'orchestration'],
    content: OPSP_APPLY_INSTRUCTIONS,
  };
}

const OPSP_APPLY_INSTRUCTIONS = `Execute an initiative by orchestrating opsx cycles for each milestone, with git worktree management and milestone review checkpoints.

**Input**: Specify the initiative name after \`/opsp:apply\` (e.g., \`/opsp:apply migrate-to-serverless\`). If omitted, list active initiatives and let the operator choose.

---

## Phase 1: Load Context & Setup

1. **Read the initiative** in \`opensprint/initiatives/\` — **resolve by the \`id:\` in frontmatter, not by filename.**
   Filenames carry a creation-date prefix (\`20261011-<name>.md\`), so \`<name>.md\` will not exist.
   \`opensprint compact board --all-branches --json\` lists every initiative with its path and the
   branch holding it. For one that lives only on its \`opsp/<initiative-name>\` branch, that path
   is a git object name: \`git show <path>\` reads the committed copy, and the initiative's
   worktree (step 3) the current one, with anything not yet committed.
   - Get the milestone list and their completion status
   - Identify the next incomplete milestone

2. **Load the operator surrogate — the views, not every record.** Do it
   from the initiative's worktree: its branch holds records the trunk does not have yet, so where
   step 3 has not made the worktree, make it first. Then:

   \`\`\`bash
   opensprint compact plan --hat dev --hat devops --json
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
     - \`opensprint/squad/index.md\` — which hat owns which question (where it does not exist, go by hat)
     - \`opensprint/squad/dev.md\` — what the system is built from, how its parts run, what it stores
     - \`opensprint/squad/devops.md\` — what is provisioned, and how a change reaches it
     - the driver-specs and ADRs this initiative lists under \`## Driver Specs\` and \`## ADRs\`,
       **in full** — they are the decisions you are about to act on

   \`index.md\` routes, and \`compact check\` does not cover it: use it to choose a hat, never as the
   source of a claim.

   **Open the full record only for the decision you are about to act on.** Every claim in a view
   cites its record id; follow the citation when the code you are changing depends on it. A
   question that belongs to product or maintainer opens \`opensprint/squad/product.md\` or
   \`opensprint/squad/maintainer.md\` first — check that hat the same way, with
   \`opensprint compact plan --hat <hat> --json\`.

   \`architecture.md\` and \`DECISION-MAP.md\` are not loaded. The first is compiled from the same
   records as the views, and nothing checks the second; open \`DECISION-MAP.md\` only to work out a
   blast radius, and confirm each edge against the record's \`depends-on\`.

   The plan lists only the sections that are not fresh; a section it omits is fresh.
   An \`open-loops\` section, in any state, is answered by the plan's own \`openLoops\`, which is
   always current. **Where it reports any other section**, the view is not enough for it:
   - \`stale\` — read the view, then read in full what moved since it was compiled: the records
     under \`added\` and \`modified\`, and the files under \`observedAdded\` and
     \`observedModified\`. Do not rely on a claim citing an id under \`removed\`.
     In a \`measures\` section those files are tests citing records: read only the ones a measure
     cites as its evidence — the plan's own \`openLoops\` is already current for the rest.
   - \`unsealed\` — the section was never compiled; often its view file does not exist yet. Read
     that section's \`inputs\` instead.
   - \`tampered\` — the view no longer says what was sealed: someone edited it by hand, or deleted
     it. Set that section aside; read its \`inputs\`, and tell the operator.

   Records the plan lists under \`unassigned\` declare no hat and appear in no view: read the ones
   that bear on this initiative.

   You are wearing dev and devops, so where those sections have inputs you may compile them now
   (\`/opsp:compact\`, sealed with \`--hat dev --hat devops\`) rather than reading around them.

   This is your "brain" for resolving questions during opsx execution.
   Think of it as: "what would the operator say?"

3. **Create initiative worktree**:

   Determine the repo name:
   \`\`\`bash
   basename $(git rev-parse --show-toplevel)
   \`\`\`

   **If neither the branch nor a worktree exists** — create fresh:
   \`\`\`bash
   git worktree add ../<repo>-opsp-<initiative-name> -b opsp/<initiative-name>
   cd ../<repo>-opsp-<initiative-name>
   \`\`\`
   Verify with \`pwd\` and \`git branch --show-current\`.

   **If the branch exists but no worktree references it** — ask the operator:
   > "Initiative branch opsp/<initiative-name> already exists. Resume from this branch or create a new one?"

   If resuming:
   \`\`\`bash
   git worktree add ../<repo>-opsp-<initiative-name> opsp/<initiative-name>
   cd ../<repo>-opsp-<initiative-name>
   \`\`\`
   Verify with \`pwd\` and \`git branch --show-current\`.

   **If the worktree already exists** at \`../<repo>-opsp-<initiative-name>\`:
   \`\`\`bash
   cd ../<repo>-opsp-<initiative-name>
   \`\`\`
   Verify with \`pwd\` and \`git branch --show-current\`.

   **The operator's main checkout is not modified.**

4. **Claim it, then open it** — whoever builds it holds the card, and the first milestone starting
   is what makes it \`building\`:

   \`\`\`bash
   opensprint claim <initiative-name>
   opensprint advance <initiative-name> --to building --hat dev
   \`\`\`

   \`claim\` names you — git's \`user.name\`, or \`--owner <name>\`. If the board shows someone else as
   its owner, ask the operator before taking it over. Both write the initiative and \`BOARD.md\`;
   commit them on the initiative branch, and offer to push it
   (\`git push -u origin opsp/<initiative-name>\`): until it is pushed, nobody else's board shows
   the card as taken. \`proposed\` → \`building\` is a handoff, so
   \`advance\` refuses it without \`--hat\`; name \`devops\` instead where the
   work is infrastructure.

   Skip this where it already declares \`building\` — the command says so and changes nothing.
   Never edit \`state:\` by hand (\`DEC-STATE-MACHINE\`).

5. **Select review mode** — ask the operator to choose:
   - **Per-milestone** (default) — pause after each milestone completes
   - **Per-change** — pause after each opsx change is archived
   - **Continuous** — run all milestones without pause (only pause for surrogate escalations)

6. **Display progress**:
   \`\`\`
   Initiative: migrate-to-serverless
   Worktree: ../<repo>-opsp-migrate-to-serverless
   Branch: opsp/migrate-to-serverless
   Review mode: per-milestone
   Progress: 1/3 milestones complete

   ✓ extract-auth-service
   → migrate-payment-endpoints (next)
     deprecate-monolith-routes
   \`\`\`

## Phase 2: Execute Milestone (OPSX Cycle)

For the next incomplete milestone, run a full opsx lifecycle **inline**:

### Step 2a: OPSX Explore
Think through the milestone at feature level. You already have the architect-level context from the initiative. Now think about:
- What specific code changes are needed?
- What modules/files are affected?
- Are there integration points to consider?

### Step 2b: OPSX Propose
Create an opsx change:
\`\`\`bash
opensprint new change "<milestone-name>"
\`\`\`
Then generate the artifacts (proposal.md, specs, design.md, tasks.md) using the opsx workflow. The proposal should reference the parent initiative and relevant driver-specs/ADRs.

### Step 2c: OPSX Apply

**Create a change worktree** before implementing:
\`\`\`bash
git worktree add ../<repo>-opsx-<initiative-name>-<change-name> -b opsx/<initiative-name>/<change-name> opsp/<initiative-name>
cd ../<repo>-opsx-<initiative-name>-<change-name>
\`\`\`
Verify with \`pwd\` and \`git branch --show-current\`.

All implementation, edits, and test runs happen inside this change worktree. Do not read or write files outside of it during implementation.

**CRITICAL: Surrogate Resolution**

When you encounter ambiguity during implementation:

1. **Check the surrogate first:**
   - Can the dev or devops view answer this? (what is built, and why — each claim cites its record)
   - Is it product's or maintainer's question? Check \`squad/product.md\` or \`squad/maintainer.md\`
   - Does a cited driver-spec or ADR settle it? Open that record in full before acting on it

2. **If YES** → resolve it silently, continue working. Note: "Resolved via DEC-001" or "Resolved via DS-PRICING" in your reasoning.

3. **If NO** → **this is a hat handoff, not an interruption.**

   A specification that does not cover everything a developer needs is the **normal case**. You have
   not hit an obstacle; you have found that product or maintainer left something unsaid
   (\`DS-ESCALATION-HANDOFF\`). Hand back, visibly.

#### Set the dev hat down

Say so plainly. Apply is **paused**, at this milestone, awaiting a named hat:

\`\`\`
══ PAUSED — milestone 2 of multi-region-failover ════════════════
   setting down the dev hat
   this question needs: product
\`\`\`

The operator has the diff in their head too. Unless something tells them which accountability they
are exercising, they will answer as a developer — and *"what should the timeout be?"* answered by
someone thinking about retries is a different answer from the same question considered against what
the business promised.

#### Ask with the classification already in it

Do **not** ask an open question and classify afterwards. You already know what you need and what
shape the answer must take, and withholding that makes the operator compose prose against a schema
they cannot see.

Infer the hat — never ask which one it is. A driver-spec's \`type\` maps to its hat, and every
decision is owned by \`dev\` or \`devops\` (\`DEC-028\`). Carry the inference *in the question*:

\`\`\`
  I need to know:    Settlement must complete within some window, and nothing
                     states it. The retry budget depends on it.

  I believe this is: product · a goal
                     inferred from: it constrains what the system must do,
                     not how it is built

  Proposed record:   DS-SETTLEMENT-WINDOW   (type: product, role: goal)

      Settlement completes within <window> of the originating transaction.

      ## Measures
      - **Primary**: <how this is known to be met>
      ### Bar
      - **dimension**: <axis>
      - **chosen**: <position>
      - **traded for**: <cost>
      - **neighbour**: <position not taken, or 'unrecorded'>

  If you confirm, this changes:
      · DEC-RETRY-BUDGET depends on DS-RTO and may need re-evaluation
      · milestone 3 (failover-runbook) is scoped against it
      · product/goals and product/measures go stale

  [1] Approve   [2] Correct the classification   [3] Answer differently
  [4] This is bigger than one record
\`\`\`

**The blast radius is part of the question, not a footnote.** Nobody can consent to a change whose
cost is not shown, and a driver-spec can invalidate decisions already made — which is the entire
premise of \`/opsp:rebuild-assess\`.

**Correcting the classification is an offered action**, which is how the inference stays falsifiable
without a second prompt. Confirming it happens by approving the record.

#### When the answer does not fit in one record

Option **[4]** exists because most escalations are a missing fact and some are not. An answer that
revises a decision already made, or invalidates milestones, is not a record to write and resume
from — it is a rung of the ladder giving way (\`DEC-ESCALATION-LADDER\`).

Ask which, by what has to move:

\`\`\`
  Does a driver-spec's STATEMENT have to change?

    yes  →  the GOAL moved.  /opsp:reexplore  — thinking time at the
            objective and goal, writing nothing, back to 'exploring'.
            Then backlog → triage → propose, as the first time.

    no, but a decision we made is wrong, or was never made
         →  the STRATEGY moved.  /opsp:repropose  — supersedes ADRs,
            may amend '## Measures', redraws the milestones beneath,
            returns to 'proposed'.

    no, everything holds — the work simply is not finished
         →  nothing moved.  This was not an escalation. Write the record
            or add the milestone and carry on.
\`\`\`

**Do not guess which.** You know what you were blocked on; you do not know whether the operator
considers the goal still right. Present the three and let them say.

**Both rungs stop apply, and both are hat changes.** \`/opsp:repropose\` returns the initiative to
\`proposed\` and \`/opsp:reexplore\` to \`exploring\`; either way \`opensprint advance\` will refuse
the move until you state the hat, because the objective and the strategy are **product and
maintainer's** and you have been wearing dev (\`DEC-HAT-HANDOFFS\`).

Re-entering at \`proposed\` rather than \`building\` is deliberate: revised milestones riding on a
state that claims work was already underway against them is exactly the bookkeeping the state
machine exists to prevent.

#### On approval

Write the record. Regenerate \`DECISION-MAP.md\` if decisions changed.

Then — and only then — you may compile that hat's view (\`DEC-COMPILE-ON-APPROVAL\`). The accountable
author is present and has just approved, which is the only condition \`DS-VIEW-AUTHORSHIP\` requires:

\`\`\`bash
opensprint compact plan --hat product
# render the stale sections
opensprint compact seal --hat product
\`\`\`

**Only the hat the escalation was classified into.** A product escalation says nothing about
maintainer's bars and licenses nothing there.

**If the operator declines or answers differently**, write nothing and compile nothing.

#### Pick the dev hat back up

Resuming is its own step, said out loud:

\`\`\`
══ RESUMING — milestone 2 ═══════════════════════════════════════
   picking the dev hat back up
   now resolved by: DS-SETTLEMENT-WINDOW
\`\`\`

The surrogate has grown. The question is never asked again.

### Step 2d: OPSX Archive, Merge & Prune
After all tasks are complete:
1. Archive the opsx change (sync delta specs to main specs if applicable, move to archive)
2. **Merge the change branch into the initiative worktree, then prune the change worktree**:
   \`\`\`bash
   cd ../<repo>-opsp-<initiative-name>
   \`\`\`
   Verify with \`pwd\`.
   \`\`\`bash
   git merge opsx/<initiative-name>/<change-name>
   \`\`\`
   Verify the merge succeeded (exit code 0).

   On success, remove the change worktree:
   \`\`\`bash
   git worktree remove ../<repo>-opsx-<initiative-name>-<change-name>
   \`\`\`
   The change branch ref is preserved for history inspection. If a correction is needed later, raise a change request — this creates a new opsx change with a fresh worktree. Do not re-attach a worktree to a merged change branch.

   **If merge conflict occurs**: PAUSE and present the conflict files to the operator. Do NOT auto-resolve merge conflicts. Do NOT remove the change worktree until the conflict is resolved. Wait for the operator to resolve them before continuing.

3. **Per-change checkpoint** (if review mode is per-change):
   Display a checkpoint with:
   - Change name and summary of what was built
   - Branch for review: \`opsx/<initiative-name>/<change-name>\`
   - Remaining changes in current milestone
   - Remaining milestones

   Present options:
   1. **"Approve and continue"** (default) — operator confirms the change is good. Log the approval in the initiative descriptor with timestamp and optional note. Proceed to next change or milestone.
   2. **"Raise change request"** — operator disagrees with the implementation. See **Change Request Flow** below.
   3. **"Switch review mode"** — change pause granularity.
   4. **"Stop here (resume later)"** — pause the initiative.

## Phase 3: Update Initiative & Milestone Checkpoint

After the milestone's opsx cycle completes:

1. Mark the milestone as done in the initiative descriptor
2. Add the opsx change name to the initiative
3. Summarize what was built and learned
4. If new ADRs or driver-specs were created, note them
5. **Compile what this milestone changed** — see below

### Compile at the boundary

The code just moved, and so did every ADR an escalation produced. \`dev\` and \`devops\` views are
compiled from exactly those things, so this is the moment they go stale — and the moment the next
milestone will read them (\`DS-VIEW-AUTHORSHIP\`).

\`\`\`bash
opensprint compact plan --hat dev --hat devops
\`\`\`

Render **only the sections it reports stale**, then:

\`\`\`bash
opensprint compact seal --hat dev --hat devops
\`\`\`

**Then re-read the sections you just rendered.** They are what the next milestone starts from, and
the copy in your context was loaded before this milestone changed anything.

If nothing is stale, say nothing and move on. A milestone that touched no manifest and produced no
decision renders nothing at all.

**You may compile \`dev\` and \`devops\` without asking.** You are wearing that hat.

### Offer product and maintainer — never compile them silently

\`\`\`bash
opensprint compact plan --hat product --hat maintainer
\`\`\`

Where those are stale, report it and **offer**:

> \`product/goals\` is stale, and compiling it means putting on the product hat.
> Compile it now?

**If the operator accepts, that is a context switch — not a render.** Set down what you are
holding: the diff, the test output, the escalation you just resolved. Load the product records.
Compile. Seal with \`--hat product\`. Then pick the dev hat back up and carry on.

Compiling while still holding the implementation produces product prose written through an
implementation lens, which is **worse than leaving the view stale** — staleness is reported, that
is not.

**If the operator declines, leave it.** It stays stale, the plan keeps reporting it, and archive
compiles it. Nothing is lost.

Neither the compile nor the offer gates the milestone. A declined or unanswered offer does not
block anything.

**Milestone checkpoint** (if review mode is per-milestone):
Display:
- Milestone name and summary of what was built
- OPSX changes completed in this milestone
- Branch for review: \`opsp/<initiative-name>\`
- Count of new commits since last milestone
- Remaining milestones

Present options:
1. **"Approve and continue"** (default) — operator confirms the milestone is good. Log the approval in the initiative descriptor with timestamp and optional note. Proceed to next milestone.
2. **"Raise change request"** — operator disagrees with the implementation. See **Change Request Flow** below.
3. **"Switch review mode"** — change pause granularity.
4. **"Stop here (resume later)"** — pause the initiative.

**If review mode is continuous**: Log a brief milestone summary and proceed to the next milestone without pausing.

**Switching review mode**: If the operator selects "Switch review mode" at any checkpoint, present the three mode options again and continue with the new selection.

---

## Change Request Flow

When the operator selects **"Raise change request"** at any checkpoint, they are indicating the implementation needs correction. This usually means the surrogate (ADRs + driver-specs) was incomplete or incorrect, leading the agent to make wrong decisions.

### Step 1: Choose a path

Present two options:
1. **"I know what needs to change"** — the operator has a clear fix in mind
2. **"I need to explore this first"** — the operator needs to think through the issue

### Path A: Direct Propose (operator knows the fix)

1. Ask the operator to describe what needs to change and why
2. Run \`/opsx:propose\` inline with the operator's description
   - The corrective change proposal MUST explicitly note any surrogate artifacts (ADRs/driver-specs) that need updating
   - If the issue traces back to a bad ADR, the change tasks should include superseding that ADR and creating a corrected one
   - If the issue traces back to a missing or wrong driver-spec, the change tasks should include updating or creating the driver-spec
3. Run the corrective opsx change through the full lifecycle: propose → apply → archive
4. After archive, proceed to **Surrogate Reload** below

### Path B: Explore First (operator needs clarification)

1. Enter an \`/opsx:explore\` session inline
   - The exploration has access to the surrogate views, the records they cite, and the current milestone's artifacts
   - Act as a thinking partner — help the operator reason through what went wrong and why
2. When the exploration concludes, ask the operator:
   - **"No changes needed"** → return to the checkpoint and present "Approve and continue" as the default option. Preserve the exploration notes in the initiative descriptor for context.
   - **"Changes needed"** → the operator describes the changes → proceed to Path A (direct propose) with the findings from exploration

### Surrogate Reload

After any corrective opsx change is archived:
1. **Reload the surrogate views** — the correction moved records, so the views moved with them:
   \`\`\`bash
   opensprint compact plan --hat dev --hat devops --json
   \`\`\`
   - Re-read \`opensprint/squad/dev.md\` and \`opensprint/squad/devops.md\`, compiling them first
     where the plan reports them stale
   - Read in full every driver-spec or ADR the corrective change created, superseded or edited
2. **Return to the same checkpoint** with the updated surrogate context
3. The operator can now:
   - **Approve and continue** — satisfied with the correction
   - **Raise another change request** — if more issues remain
   - **Switch review mode** or **Stop**

This creates a natural feedback loop: checkpoint → change request → correction → reload → checkpoint.

## Phase 4: Next Milestone or Complete

- If more milestones remain → return to Phase 2 for the next one
- If all milestones done → display completion summary:

\`\`\`
## Initiative Complete: migrate-to-serverless

Worktree: ../<repo>-opsp-migrate-to-serverless
Branch: opsp/migrate-to-serverless
Milestones: 3/3 ✓
OPSX Changes: extract-auth-service, migrate-payment-endpoints, deprecate-monolith-routes
New ADRs: DEC-003 (Express for serverless), DEC-004 (DynamoDB for sessions)
New Driver Specs: DS-LATENCY (sub-200ms API response)

The initiative worktree contains all changes.
\`\`\`

### Hand the initiative over

Escalation **borrows** a hat for one question and gives it back. This is the other gesture: the dev
hat comes off and does not go back on. Mark it:

\`\`\`bash
opensprint advance <initiative-name> --to ready-for-attestation --hat dev
\`\`\`

Then say so, in those terms:

\`\`\`
══ HANDOFF — multi-region-failover ══════════════════════════════
   3/3 milestones done · nothing judged yet
   setting down:  dev, devops
   waiting on:    product, maintainer

   Next:  /opsp:attest multi-region-failover
\`\`\`

**This state exists because the hats are usually the same person**
(\`DS-HATS-AS-CONTEXT\`). An engineer who has just finished building will attest what they built
unless something marks the moment the accountability moves — and \`building\` → \`attested\` with
nothing in between gives that moment nowhere to live (\`DEC-STATE-MACHINE\`).

**Do not run \`/opsp:attest\` in this session.** \`DEC-043\` refuses the author; the handoff is to a
fresh context, not to your next step.

**The handoff is reversible.** \`/opsp:attest\` sends it back to \`building\` where the work was
unfinished; \`/opsp:repropose\` to \`proposed\` where the strategy was wrong; \`/opsp:reexplore\` to
\`exploring\` where the goal was. What it is not is skippable.

---

## Worktree & Branch Management

Branch naming convention:
- **Initiative branches**: \`opsp/<initiative-name>\` (created once at start)
- **Change branches**: \`opsx/<initiative-name>/<change-name>\` (created per opsx change)

Worktree path convention (siblings of the main checkout):
- **Initiative worktrees**: \`../<repo>-opsp-<initiative-name>\`
- **Change worktrees**: \`../<repo>-opsx-<initiative-name>-<change-name>\`

Where \`<repo>\` is the basename of the main checkout directory (from \`basename $(git rev-parse --show-toplevel)\`).

Git uses forward slashes for branch names on all platforms (including Windows). Worktree filesystem paths use hyphens to avoid the slash restriction on Windows paths.

Change worktrees are pruned immediately after a successful merge into the initiative worktree. The branch ref is kept for history. Corrections to merged changes always produce a new opsx change with a fresh worktree.

The operator's main checkout is never modified. All agent activity happens inside initiative and change worktrees.

---

## Context Management for Long Initiatives

When processing multiple milestones, context window may get long. To manage this:

- After completing each milestone, summarize the completed work into a brief paragraph
- Drop implementation details (specific code, file paths) from prior milestones
- ALWAYS retain the loaded views and the initiative's own driver-specs and ADRs — these never get trimmed
- Drop a full record opened for one decision once that decision is acted on; its view citation remains
- The surrogate grows across milestones as new ADRs/driver-specs are added, and the views are recompiled at each boundary

---

## Guardrails

- **Surrogate first** — Always check the views, and the records they cite, before asking the operator
- **Views, then records** — Orient on the views; open a full record only for the decision you are about to act on
- **Reformulate escalations** — Never present raw implementation questions. Elevate to architectural level.
- **Sequential milestones** — Complete one before starting the next. Each cycle's learnings inform the next.
- **Update initiative** — Keep the initiative descriptor current after each milestone
- **Don't skip archive** — Each opsx cycle must be properly archived before moving on
- **Worktree per change** — Always create a change worktree before implementing, prune it after merge
- **Verify cwd before file operations** — After every \`cd\`, run \`pwd\` and \`git branch --show-current\` before any reads, writes, or git mutations
- **Pause at checkpoints** — Respect the operator's chosen review mode for pausing
- **Approve explicitly** — Log approvals in the initiative descriptor for audit trail
- **Change requests fix the surrogate** — When the operator raises a change request, ensure corrective changes update the root cause (ADRs/driver-specs), not just the symptoms (code)
- **Reload after correction** — Always reload the surrogate views after a corrective change before returning to the checkpoint
- **Corrections create new worktrees** — Never re-attach a worktree to a merged change branch; raise a change request to get a fresh worktree
`;
