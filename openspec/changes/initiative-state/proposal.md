## Why

Milestone 5 of `lifecycle-beyond-build`. Milestone 4 made an initiative readable; this makes its **state** mean something.

`DS-PROGRESSIVE-CRYSTALLIZATION` says an initiative's state is how far down OGSM it has crystallized — Objective and Goal at exploration, Strategy and the bar at proposal, posture and evidence at attestation. `DEC-024` decides that state is **declared by the tool and checked by code**, following the `DEC-010` manifest pattern rather than being fully derived: full derivation is drift-proof but brittle, and an initiative whose milestones were delivered out of order would be misclassified with no way for the operator to say otherwise.

Today `state` is a frontmatter string nothing reads. Both initiatives written before this session carry `status: completed` with no record of how they got there, which is exactly the drift the check exists to catch.

## What Changes

- `INITIATIVE_STATES` — an explicit, ordered vocabulary: `exploring`, `proposed`, `building`, `attested`, `completed`, plus the terminal `declined` (`DEC-035`)
- `checkInitiativeState(entry)` reports three problems: a state outside the vocabulary, a state contradicted by the content, and an active initiative declaring none
- The check reports **contradictions**, not an exact match to a derived state
- `declined` is terminal and resolved: an initiative carrying it is never reported as stale

## Capabilities

### Modified Capabilities
- `opsp-initiative-artifact`: an initiative's state is a checked vocabulary rather than free text

## Impact

- **Reporting only.** Nothing is gated — `DEC-023` holds. The check surfaces disagreement; the operator decides.
- **Older initiatives are not nagged into a state they never had.** An initiative carrying `status: completed` and no `state` is read as resolved.
- **`attested` and `completed` cannot yet be distinguished from content**, because attestation does not exist until milestone 9. The check says so rather than guessing.
- **New**: state vocabulary and check in `src/core/initiatives.ts`
