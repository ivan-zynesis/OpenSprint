## Why

Milestone 12 of `lifecycle-beyond-build`, and the last. It brings the **published-documentation venue** under the lifecycle.

The compiled surrogate is the operating record: detailed, cited, read by agents and by whoever is doing the work. It is not what an external stakeholder needs, and compiling cannot produce that — a shorter account, free of record ids, for a reader who will never follow a citation. Nothing in the lifecycle asked for it and nothing checked whether it existed.

Milestone 11 also left three questions parseable but unharvested. An initiative could claim to be attested while recording no door, no blast radius and nobody accountable, and nothing said so.

## What Changes

- **`docsDir`** in `openspec/config.yaml`, defaulting to `docs/` — attest's one free write target (`DEC-044`)
- **Documentation adequacy becomes a review question**: is what exists adequate for what shipped, is anything now wrong, does an accepted exposure need saying out loud (`DS-DOCUMENTATION-REVIEWED`)
- **Three harvest rules** — `reversibility-unstated`, `blast-radius-unstated`, `raci-unassigned` — firing only once an initiative claims to be attested

## Capabilities

### Modified Capabilities
- `config-loading`: `docsDir` configures where external-facing documentation lives
- `opsp-attest-workflow`: documentation is reviewed, and written to the configured directory on confirmation
- `opsp-rule-harvesting`: what an attestation left unanswered is reported

## Impact

- **No loops on this repository yet.** Nothing claims `state: attested`, so the three new rules are correctly silent. They were verified by test rather than inferred from the quiet result.
- **The record bound does not move.** Attest still writes only `## Measures` and `## Attestation` inside the surrogate; the documentation directory is separate and unchecked, because prose for humans needs none of the protections a record does.
- **Sixteen loop kinds**, up from thirteen.
- **Modified**: `src/core/project-config.ts`, `src/core/compact/rules.ts`, `loops.ts`, `src/commands/compact.ts`, `src/core/templates/workflows/opsp-attest.ts`
