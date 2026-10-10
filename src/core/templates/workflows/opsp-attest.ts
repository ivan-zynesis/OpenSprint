/**
 * OPSP Attest Workflow Template
 *
 * The ex-post half of a measure: was the bar met, what asserts it, what
 * remains exposed. Runs on the open initiative PR, before archive.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpspAttestSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-attest',
    description:
      'Attest an initiative — assess each bar against CI evidence and record posture, evidence and exposure. Writes a record; never gates.',
    instructions: OPSP_ATTEST_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspAttestCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Attest',
    description: 'Attest an initiative — posture, evidence and exposure against each bar',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'attest', 'initiative', 'evidence'],
    content: OPSP_ATTEST_INSTRUCTIONS,
  };
}

const OPSP_ATTEST_INSTRUCTIONS = `Review an initiative against the strategy it proposed, and record what you find.

**Input**: the initiative name after \`/opsp:attest\`. If omitted, list initiatives whose milestones are all complete and let the operator choose.

This is the stage that asks whether the bar was met — and the handoff where a change leaves \`dev\` and becomes a security and operations concern.

---

## Before anything else: are you the author?

**Stop if this session wrote the implementation or its tests.**

Not "set it aside". Not "focus on the bar instead". Stop, say so, and ask for a fresh session. An
agent that wrote the tests cannot judge whether those tests assert the bar — it already believes
they do, which is why it wrote them that way (\`DEC-043\`).

Where a person is attesting by hand, the same holds: whoever wrote the tests should not be the one
grading them.

## What you load, and what you must not

\`\`\`
LOAD                                 DO NOT LOAD
──────────────────────────────       ─────────────────────────────
the initiative's Objective + Goals   the implementation source
the bars (given / when / then)       the design discussion
the TEST FILES                       the ADR rationales
the maintainer rows in scope         the conversation that built it
the CI evidence artifacts
\`\`\`

**Why tests and not source.** A test is the implementation's own restatement of a bar — \`DEC-038\`
already writes bars as \`given / when / then\`, which is test syntax. Comparing a bar to its tests
compares two statements at the same altitude. Comparing a bar to source compares across altitudes,
and that asymmetry is how an attester talks themselves into a pass, because source always looks
reasonable to whoever is reading it.

**Why not the rationales.** An ADR argues *for the mechanism that was chosen*. Loading it shifts the
question from "was the bar met" to "was the mechanism reasonable" — a different question with a
different owner (\`DEC-040\`).

---

## Step 1: Read the bars

\`\`\`bash
openspec compact plan --json
\`\`\`

For each driver-spec the initiative claims, read its \`## Measures\`. The **bar** states the
acceptance criterion. A record already showing \`authority: attested\` has been judged before —
re-attesting is legitimate, since attestations age, but say that is what you are doing.

## Step 2: Read the tests, then the evidence

Find the tests covering each bar. Ask one question of them:

> **Does this test actually assert the bar — or does it assert something adjacent that happens to pass?**

A green suite that never touches the bar satisfies a CI artifact completely and proves nothing. That
is the most common way a measure is met on paper and not in fact, and it is the specific thing you
are here to catch.

Then the CI artifacts. **Evidence is a CI artifact** (\`DS-CI-ATTESTATION\`): a coverage report, a
recorded end-to-end run, a \`terraform plan\`, a cost diff, a scan result. Something the pipeline
produced, addressable from the pull request. Prose describing a belief is not evidence.

**If the tests do not assert the bar, that is the finding.** Do not open the source to work out
whether the bar holds anyway — that is the move this tool exists to prevent.

## Step 3: Record the verdict, and what it requires

\`\`\`markdown
### Posture

- **verdict**: met | partially met | not met | cannot assess
- **attested-by**: <who>
- **attested-on**: <YYYY-MM-DD>

<what the evidence showed>
\`\`\`

**The verdict decides what else you owe** (\`DEC-041\`):

| Verdict | Write |
|---|---|
| \`met\` | \`### Evidence\` — the artifact, addressable |
| \`partially met\` · \`not met\` · \`cannot assess\` | \`### Exposure\` — what remains at risk, and \`mitigated-by\` |

A record counts as **attested** only when it carries both an attestation date and evidence — a
verdict with nothing asserting it is an opinion, and the harvest keeps reporting until both are
there.

\`cannot assess\` is a **complete attestation**, not a failure to finish. Name what the evidence could
not answer, record the exposure, and stop looking.

## Step 4: Answer the three review questions

These describe the **change**, not any one measure, so they go in an \`## Attestation\` section on the
initiative (\`DEC-042\`). Grill the operator until each is answered.

\`\`\`markdown
## Attestation

- **door**: two-way — the feature flag reverts without data migration
- **blast-radius**: checkout path, payment reconciliation, the nightly settlement job

### RACI

| Concern | Handled by | R | A | C | I |
|---|---|---|---|---|---|
| settlement alerting | system — pagerduty svc-settle | — | — | — | — |
| manual reconciliation | **not automated** | ops-oncall | head-of-eng | finance | support |
\`\`\`

**1 · One-way or two-way door.** Can this be rolled back without irreversible damage? A two-way door
says what makes the rollback safe. A one-way door is not a problem — it is a thing everyone should
know before merging.

**2 · Blast radius.** What does this affect? Ask hardest where an exposure is being accepted: an
unmitigated risk in something nothing else touches is a different proposition from one in the
payment path.

**3 · RACI, for whatever no system handles.** The pull request closing ends \`dev\`'s accountability.
Past that point the change lives in security and operations.

Go concern by concern. For each, ask first: **is this handled by a system?** If monitoring, alerting
or automation covers it, name the system and move on — no human names needed. **RACI is the residue
after automation**, and the table should shrink as a team automates more.

Where nothing handles it, a human is named: **R**esponsible does the work, **A**ccountable answers
for it. Consulted and Informed are optional.

Do not accept "the team" or "ops" as an answer. A concern owned by everyone is owned by nobody, and
the first incident is when that gets discovered.

## Step 5: Verify you stayed in bounds

\`\`\`bash
git diff --unified=0 -- opensprint/driver-specs/ opensprint/initiatives/
\`\`\`

Every hunk must fall inside a \`## Measures\` or \`## Attestation\` section. If you changed a Statement,
a Decision, a Rationale or any frontmatter, **revert it**. Revising a claim is a new decision —
\`/opsp:decide\` — not an amendment. The bound (\`DEC-027\`) is what keeps \`DEC-006\`'s guarantee meaningful:
a record's claim never changes under a reader who cited it.

---

## What this tool must never do

**It never gates** (\`DEC-023\`). It always exits zero. It does not block \`/opsp:archive\`, a merge or
a release, and it does not mark anything approved. An unmet bar is an exposure with a forward
pointer; an unanswered question is an open loop.

Recording who holds a risk is change management's **recording** half, which \`DS-SURROGATE-SCOPE\`
admits deliberately. Deciding whether the risk is acceptable is its **governing** half, which stays
out — along with certification and release management. The moment this tool gains a pass/fail exit,
that boundary is gone.

**It never invents.** If a bar is not stated, say so rather than inferring one from the tests. If
nobody can be named as attester or as accountable, ask; an attestation with no attester is an
anonymous opinion, and a RACI row with no owner is a gap wearing a plan's clothes.

---

## When you are done

\`\`\`bash
openspec compact plan --json   # records should now report authority: attested
openspec compact loops         # measure-unattested should have moved
\`\`\`

Report how many bars were met, how many could not be assessed, every exposure with the work planned
against it, and every concern that is **not** handled by a system. Then hand to \`/opsp:archive\`,
which compiles the documentation and cannot honestly run before this does (\`DS-ATTESTED-TRUTH\`).
`;
