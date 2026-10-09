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

const OPSP_ATTEST_INSTRUCTIONS = `Assess each of an initiative's bars against the evidence, and record what you find.

**Input**: the initiative name after \`/opsp:attest\`. If omitted, list initiatives whose milestones are all complete and let the operator choose.

---

## Before anything else: clear your context

**This is the whole point of the tool.** Most hats are worn by the same engineer
(\`DS-HATS-AS-CONTEXT\`), so attestation is usually self-assessment — and an agent that just wrote
the code has every argument for why it works already in context. Self-assessment at zero distance
is not assessment.

So you arrive narrow, and you stay narrow:

\`\`\`
LOAD                                 DO NOT LOAD
──────────────────────────────       ─────────────────────────────
the initiative's Objective + Goals   the implementation diff
the bars (given / when / then)       the design discussion
the maintainer rows in scope         the ADR rationales
the CI evidence artifacts            the conversation that built it
\`\`\`

Excluding the ADR rationales is the part that will feel wrong and is right. \`DS-STRATEGY-ALTITUDE\`
places attestation at the **bar**, not the mechanism — whether the implementation is well-reasoned
is not the question being asked. **The bar is the contract.** A rationale is an argument for the
thing that was built, so loading it biases you toward accepting.

If you are continuing a session in which the implementation was written, **say so and stop.** Ask
the operator to run this in a fresh session. A narrow context you arrived at by forgetting is not
a narrow context.

---

## Step 1: Load the bars

\`\`\`bash
openspec compact plan --json
\`\`\`

For each driver-spec the initiative claims, read its \`## Measures\` section — the **bar** states
the acceptance criterion, usually as \`given / when / then\` for a maintainer bar or
\`as-a / I-want / for\` for a product one.

A record whose \`authority\` is already \`attested\` has been assessed before. Re-attesting it is
legitimate — attestations age — but say that is what you are doing.

## Step 2: Find the evidence

**Evidence is a CI artifact** (\`DS-CI-ATTESTATION\`): a coverage report, a recorded end-to-end run,
a \`terraform plan\`, a cost diff, a scan result. Something the pipeline produced, addressable from
the pull request.

Prose describing a belief is not evidence. Neither is reading the code — you may not.

**If the evidence cannot answer the bar, that is a finding about the evidence.** Record:

\`\`\`markdown
### Posture

- **verdict**: cannot assess — no e2e coverage for the checkout path
- **attested-by**: <who>
- **attested-on**: <YYYY-MM-DD>
\`\`\`

and an exposure naming what is missing. Then **stop looking**. Do not go and read the
implementation to work it out; that is the exact move this tool exists to prevent, and the
resulting backlog item is what makes the next attestation possible.

## Step 3: Write the three parts

Amend the record's \`## Measures\` section — and **nothing else** (\`DEC-027\`):

\`\`\`markdown
### Posture

- **verdict**: met | partially met | not met | cannot assess
- **attested-by**: <who>
- **attested-on**: <YYYY-MM-DD>

<a sentence on what the evidence showed>

### Evidence

<the artifact, addressable: a CI run, a report path, an artifact id>

### Exposure

<what remains at risk, who it reaches>
mitigated-by: <initiative-id>   # where work is planned to close it
\`\`\`

A record is only **attested** when it carries both an attestation date and evidence. A verdict
with nothing asserting it is an opinion, and the harvest will keep reporting
\`measure-unasserted\` until both are there.

## Step 4: Verify you stayed in bounds

\`\`\`bash
git diff --unified=0 -- opensprint/driver-specs/
\`\`\`

Every hunk must fall inside a \`## Measures\` section. If you changed a Statement, a Decision, a
Rationale or any frontmatter, **revert it**. Revising a claim is a new decision — \`/opsp:decide\` —
not an amendment, and the distinction is what keeps \`DEC-006\`'s guarantee meaningful: a record's
claim never changes under a reader who cited it.

---

## What this tool must never do

**It never gates** (\`DEC-023\`). It always exits zero. It does not block \`/opsp:archive\`, a merge,
a release or anything else. It does not mark an initiative approved, signed off or released.

The moment it gains a pass/fail exit or blocks an archive it has become **certification**, and
\`DS-SURROGATE-SCOPE\` puts certification out of scope precisely because it drags change management
and release management in behind it.

An unmet bar is recorded as an exposure with a forward pointer, **not** as a failure. It will nag
by visibility — a harvested open loop and a row on the board — which is the most this system is
willing to do about it.

**It never invents.** If a bar is not stated, say so rather than inferring one from the code. If
nobody can be named as the attester, ask; an attestation with no attester is an anonymous opinion.

---

## When you are done

\`\`\`bash
openspec compact plan --json   # confirm the records now report authority: attested
openspec compact loops          # measure-unasserted / measure-unexposed should have moved
\`\`\`

Report what you found: how many bars were met, how many could not be assessed, and every exposure
you recorded with the work planned against it. Then hand to \`/opsp:archive\`, which compiles the
documentation — and which cannot honestly run before this does (\`DS-ATTESTED-TRUTH\`).
`;
