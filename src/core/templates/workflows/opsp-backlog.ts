/**
 * OPSP Backlog Workflow Template
 *
 * Flush an in-memory brainstorm to disk as an initiative at state: exploring.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspBacklogSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-backlog',
    description:
      'Persist a brainstorm as a backlog item — an initiative holding an objective and a goal, at state: exploring. The deliberate flush that /opsp:explore does not do.',
    instructions: OPSP_BACKLOG_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspBacklogCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Backlog',
    description: 'Persist a brainstorm as an initiative at state: exploring',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'backlog', 'initiative', 'ideation'],
    content: OPSP_BACKLOG_INSTRUCTIONS,
  };
}

const OPSP_BACKLOG_INSTRUCTIONS = `Write what was just brainstormed to disk, as a backlog item.

**Input**: an initiative name after \`/opsp:backlog\` (kebab-case). If omitted, derive one.

---

## What this is

\`/opsp:explore\` writes nothing, deliberately — most exploration should not survive, and a tool that
saves everything fills the backlog with noise. This is the **deliberate flush**: the moment you
decide a thought is worth keeping (\`DEC-034\`).

It can fire mid-conversation. One idea crystallises, you keep it, the conversation goes on.

A backlog item is **complete at its own altitude**. It holds an Objective and a Goal — what and why.
Strategy and the bar come later, at \`/opsp:propose\`. It may sit for weeks. It may never be picked
up, and that is a legitimate outcome rather than a failure.

## Step 1: Be in the right worktree

An initiative lives in its own branch from its first persisted thought to its merge (\`DEC-029\`).
**Do not assume the operator put you there.**

\`\`\`bash
git branch --show-current
\`\`\`

**If you are already on \`opsp/<initiative>\`** for this idea, stay.

**If the branch exists but you are elsewhere**, switch to its worktree.

**If neither exists**, create both:

\`\`\`bash
git worktree add ../<repo>-opsp-<initiative-name> -b opsp/<initiative-name>
cd ../<repo>-opsp-<initiative-name>
\`\`\`

Verify with \`pwd\` and \`git branch --show-current\` before writing anything.

Planning on \`main\` was tried and failed within the hour: \`/opsp:apply\` built a worktree from
\`main\`'s last commit while the planning records sat uncommitted on it, so the branch meant to
implement them could not see them.

## Step 2: Write the initiative, and nothing else

Write it to \`opensprint/initiatives/<YYYYMMDD>-<initiative-name>.md\` — today's date, no
separators (\`DEC-036\`). A directory listing then reads in the order the thinking
happened, which is the order a backlog is triaged in. Readers resolve by \`id:\`, not by filename.

\`\`\`markdown
---
id: <initiative-name>
status: active
state: exploring
created: <YYYY-MM-DD>
---

## Description

<the objective: the long-term direction this serves>

<the goal: what must become true, stated so you could tell whether it had>

<what prompted this — the real-world context. A new business need, a trend
worth riding, an operation worth optimising, an open loop the last compile
reported.>
\`\`\`

Then commit it on the item's branch and put it on the board — \`opensprint compact board
--all-branches\` reads committed branches, so an uncommitted item is on nobody's board:

\`\`\`bash
git add opensprint/initiatives/
git commit -m "backlog: <initiative-name>"
opensprint compact board
git add opensprint/BOARD.md
git commit --amend --no-edit
\`\`\`

Regenerate the board **after** the first commit. Until the branch has a commit of its own, git
cannot tell it from a branch that already merged, and the board would report the item as landed.

Offer to push the branch (\`git push -u origin opsp/<initiative-name>\`). Until it is pushed,
nobody else can see the item.

**Driver-specs and ADRs are not written here.** They are \`/opsp:propose\`'s output, and a premature
record is a false claim that something later will depend on. An initiative claims nothing — it
records that someone is thinking about something, which is both true and useful.

## Step 3: Draft OGSM on the author's behalf

**A stakeholder filing an idea never sees OGSM** (\`DS-HATS-AS-CONTEXT\`). They give you a few
sentences of real-world context; you turn that into an Objective and a Goal.

If the context is thin, ask **one** question — the one whose answer most changes what gets written.
Do not interview.

## Step 4: Confirm and stop

Show what you wrote. Then stop.

Do not offer to propose it, do not start classifying it into records, and do not ask whether they
want to proceed. The next step is \`/opsp:triage\`, and it happens when someone picks the item up —
possibly not today.

\`\`\`
Backlogged: <initiative-name>  (state: exploring)
  branch: opsp/<initiative-name>

  <one line of what it is>

Picked up later with /opsp:triage.
\`\`\`

---

## Guardrails

- **The initiative, and nothing else.** No driver-specs, no ADRs, no milestones.
- **Never on \`main\`.** Create or switch to the initiative's worktree first.
- **Never interview.** One question at most, then write.
- **Never advance it.** \`state: exploring\` is where this leaves it.
- **Leave it unowned.** Filing an idea is not committing to build it; whoever picks it up at
  \`/opsp:triage\` takes the card.
- **Dying here is fine.** Most backlog items are never picked up; \`/opsp:triage\` can decline it, and
  why it was declined is worth more than the idea.
`;
