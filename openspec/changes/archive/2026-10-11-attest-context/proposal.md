## Why

Milestone 4 of `sdlc-operating-contract`. `/opsp:attest` already carries the narrow context and already says evidence is a CI artifact (`DS-CI-ATTESTATION`). What it did not have was the other half of that sentence: nothing checked whether the artifact an attestation named could be found.

That gap is load-bearing. `attested` is the strongest of the three citation authorities — a compiled view says a bar was *met*, on a date, by a named attester, and a reader is meant to stop looking. An attestation whose evidence reads "the suite passed" produces that claim and asserts nothing, which is the same failure as an untested decision, one layer up.

## What Changes

- `evidenceReferences(block)` — the addressable references an evidence block carries, in two explicit forms: a markdown link and a backticked path
- `evidence-unresolvable` — a seventeenth open loop, firing on a block with no reference and on a local path not in the tree
- `deriveOpenLoops` takes an optional resolver; `compact` supplies one bounded to the project root
- `/opsp:attest` mandates the two forms, names the loop, and says the compiler does not go to the network
- The loop-kinds table in `docs/concepts.md` completed — it had been stale by four kinds

## Capabilities

### Modified Capabilities
- `opsp-rule-harvesting`: evidence must resolve, and the kind list is correct again
- `opsp-attest-workflow`: the form of an evidence reference is mandated

## Impact

- **The compiler never goes to the network.** A remote reference is accepted on sight. Resolving one would make a compile non-deterministic, slow, and dependent on credentials the reader may not hold — and a failed fetch reports the network, not the record, which is exactly the invented gap `DEC-007` forbids.
- **Prose is not scanned for things that look like paths.** `coverage/index.html` in a sentence is not a reference; the same token in backticks is. The author says what is an address.
- **Three existing fixtures changed** from prose evidence to a backticked path. They were examples of the thing this loop now reports.
