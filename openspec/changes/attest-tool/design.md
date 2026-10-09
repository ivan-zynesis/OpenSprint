## Context

`DEC-022` makes attest a separate tool. `DEC-023` forbids it from gating. `DEC-027` bounds what it may write. `DEC-033` bounds what it may read.

## Goals / Non-Goals

**Goals**
- A skill that assesses bars against evidence and writes the three ex-post parts
- A deterministic check that an amendment stayed inside `## Measures`

**Non-Goals**
- `mitigated-by` edges and the exposure gradient — milestone 10
- Running it on this repository — the operator's call

## Decisions

### The narrow context is stated as a refusal, not a preference

An agent told to "focus on the bar" will read the diff anyway when the evidence is thin. So the instructions say what to do instead: record `cannot assess`, name the missing coverage, and **stop looking**.

They also tell the agent to refuse outright if it is continuing the session that wrote the implementation. A narrow context arrived at by forgetting is not a narrow context, and that is the common case when one engineer wears every hat (`DS-HATS-AS-CONTEXT`).

### The amendment bound is checkable, not only instructed

`DEC-027` says attest writes `## Measures` and nothing else. A skill can be told that; `checkAmendment` lets it be verified. Everything outside the section is compared byte for byte, with trailing whitespace normalised so that appending a record's first `## Measures` counts as bounded.

That matters because it is the first tool to modify an existing record. Without a check, the bound would erode one convenience at a time — which is exactly how `DEC-023` describes the scope boundary eroding.

### Inadequate evidence is a valid outcome, and a productive one

`posture: cannot assess` with an exposure naming the missing coverage is a complete attestation. It does not block (`DEC-023`), and it generates the backlog item that makes the next attestation possible. The system emits its own instructions for becoming attestable.

## Risks / Trade-offs

**The attester cannot diagnose a near-miss.** Told a bar was not met, it cannot say why, because that needs the code. Accepted and stated in `DEC-033`: diagnosis is the dev hat's work, and mixing the two is what this prevents.

**The narrow context is enforced by instruction, not by the harness.** Code can check what was written; it cannot check what was read. The instructions are therefore written to make the wrong move obvious rather than merely discouraged.

## Migration Plan

None. The workflow is new.

## Open Questions

None blocking.
