## Why

Milestone 10 of `lifecycle-beyond-build`, and the one that closes the loop in the direction it never closed.

`DS-LOOP-CLOSURE`'s arrow goes **backward**: a rule fails, you revisit the decision behind it. That arrow is correct and stays. It has no answer for the exposure discovered at attestation, because nothing went wrong upstream — the constraint was right, the decision was right, the implementation matched the spec. The bar simply was not met.

There is no backward target. The only honest response points **forward**, at work not yet done.

Without that edge a surrogate accumulates known gaps with no stated plan, which is the failure mode of every risk register ever maintained. Stating the gap is easy and nearly worthless; stating what will close it, and how far along that work is, is what a reader can act on.

## What Changes

- `### Exposure` carries `mitigated-by: <initiative-id>`, read from beside the prose rather than from frontmatter
- New `exposure-unmitigated` harvest rule — an exposure pointing at nothing
- The board's **Roadmap** section renders every exposure beside the live state of what mitigates it
- That state is the **assurance level**: nothing is a confession, `exploring` means we know and are thinking, `proposed` means committed with a bar, `building` means in flight, `declined` means the exposure stands

## Capabilities

### Modified Capabilities
- `opsp-rule-harvesting`: an exposure with no planned work is reported
- `opsp-board`: the roadmap is compiled, with assurance resolved from initiative state

## Impact

- **One exposure on this repository, pointing nowhere.** `DS-HIGH-IMPACT-OPS` records that a corrupted surrogate degrades every downstream operation unboundedly, and nothing is planned against it. The board now says "a confession" rather than leaving it unstated — which is accurate, so it stays that way.
- **A dangling pointer is not treated as mitigated.** An exposure naming an initiative that does not exist renders as "points nowhere real", because a confession wearing a plan's clothes is worse than a confession.
- **Modified**: `src/core/compact/measures.ts`, `src/core/compact/loops.ts`, `src/core/board.ts`
