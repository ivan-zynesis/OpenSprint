## Context

`DEC-021` adds `attested` as a third citation authority beside `decided` and `observed`, and says only it licenses an unqualified present-tense claim about a property of the system.

## Goals / Non-Goals

**Goals**
- Carry attestation metadata on a record and compute its authority
- Make the authority visible to the renderer
- State the three-authority contract in the skill

**Non-Goals**
- Writing attestations — `/opsp:attest`, milestone 9
- Expiring a stale attestation — `DEC-021` leaves the threshold open
- Gating on authority — `DEC-023` holds

## Decisions

### Attestation metadata lives in `### Posture`, as labelled lines

`### Bar` already reads labelled lines by explicit lookup against a fixed vocabulary, and posture needs the same three facts every time: what the verdict was, who asserted it, when. Reusing the mechanism means one parser and one convention rather than two.

```markdown
### Posture

- **verdict**: met
- **attested-by**: ivan
- **attested-on**: 2026-10-09

The build fails on a committed credential.
```

Prose beneath the labels is kept — the labels are the structured part, not the whole block.

### Evidence is required for attestation, not just a verdict

A posture saying "met" with nothing asserting it is an opinion, and `DS-ATTESTED-TRUTH` is specifically about the difference. So `attested` requires **both** `attested-on` and a populated `### Evidence`. A verdict without evidence reports as `decided` and the existing `measure-unasserted` loop names the gap.

### Authority is computed, never declared

A record cannot claim to be attested in frontmatter. The authority falls out of what the measure carries, which means it cannot drift from the evidence — the same reasoning that makes views compiled rather than authored (`DEC-006`).

### Staleness is surfaced, not enforced

`DEC-021`'s invalidation trigger contemplates degrading stale attestations to `decided`, but sets no threshold, and no project has data to choose one. So `attested-on` is carried and shown; nothing expires. Inventing a window would be a decision nobody made.

## Risks / Trade-offs

**Every record reports `decided` until milestone 9 lands.** That is not a defect — it is the honest state of a surrogate where nothing has been attested, and it is what `DS-ATTESTED-TRUTH` was written to expose. The compiled views should start saying so.

**The renderer must honour the authority, and the renderer is a skill.** Code can report which authority applies; it cannot force prose into the right tense. This is the deterministic/synthetic split working as designed, and the contract is stated as sharply as it can be.

## Migration Plan

None. A record with no attestation metadata reports `decided`, exactly as today.

## Open Questions

None blocking. The staleness threshold stays open on `DEC-021`.
