## Why

Milestone 11 of `lifecycle-beyond-build`, and the one that turns attestation from a sign-off into a review.

`DEC-033` excluded the entire implementation from the attester's context, on the reasoning that an agent holding the diff rationalises. That was right about the risk and wrong about the artifact: with only a bar and a CI artifact, an attester cannot tell a suite that **ran** from a suite that **asserted the bar** — which is the most common way a measure is satisfied on paper and not in fact.

Two other things were wrong and are corrected here. The harvest demanded evidence *and* exposure of every populated measure regardless of verdict, which produced 35 loops on a repository where nothing had been attested at all. And nothing recorded what happens after the merge: a pull request closing ends `dev`'s accountability, and no artifact named who holds the change once it reaches security and operations.

## What Changes

- **Reading scope**: test files are in; implementation source, design discussion and ADR rationales stay out (`DEC-040`, superseding `DEC-033`)
- **Posture is the judgement**: `met` requires evidence, anything else requires exposure, and a measure with no posture is `measure-unattested` rather than two misleading loops (`DEC-041`)
- **Three review questions** on the initiative — one-way or two-way door, blast radius, and a RACI table that is the residue after automation (`DEC-042`)
- **The agent that wrote the tests may not attest them** (`DEC-043`)

## Capabilities

### Modified Capabilities
- `opsp-rule-harvesting`: measure loops become conditional on the verdict; `measure-unattested` added
- `opsp-attest-workflow`: reads tests, answers three questions, refuses the authoring session
- `opsp-initiative-artifact`: an initiative carries an `## Attestation` section

## Impact

- **Loop counts fall and sharpen.** On this repository `measure-unasserted` and `measure-unexposed` drop from 35 combined to the number of measures actually judged; everything unjudged reports once, as `measure-unattested`.
- **The three questions are parsed here and harvested in milestone 12.** This milestone makes them readable and writes them; `reversibility-unstated`, `blast-radius-unstated` and `raci-unassigned` follow.
- **`DEC-033` becomes superseded**, so the rule citing it reports `rule-guards-dead-record` until the test is updated — which this change does.
- **Modified**: `src/core/compact/measures.ts`, `loops.ts`, `src/core/initiatives.ts`, `src/core/templates/workflows/opsp-attest.ts`
