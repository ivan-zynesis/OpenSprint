## Context

`DEC-040` through `DEC-043` were recorded before implementation. This change is those four decisions.

## Goals / Non-Goals

**Goals**
- Reading scope widened to tests, narrowed nowhere else
- Measure loops conditional on posture, plus `measure-unattested`
- `## Attestation` parsed from an initiative
- The authoring-session refusal covers test authorship

**Non-Goals**
- The documentation write target — milestone 12
- `reversibility-unstated`, `blast-radius-unstated`, `raci-unassigned` — milestone 12
- Any gate. `DEC-023` holds: attest exits zero.

## Decisions

### The verdict vocabulary is an explicit list

`met`, `partially met`, `not met`, `cannot assess`. Looked up by name, not matched by pattern — a
verdict outside the list is reported rather than guessed at, because the whole conditional rests on
which branch it takes.

`met` is the only verdict requiring evidence. Everything else requires exposure, including
`cannot assess`, which is a complete attestation naming what the evidence could not answer.

### `measure-unattested` replaces two misleading loops

Previously a measure with no posture reported both `measure-unasserted` and `measure-unexposed` —
two findings, neither actionable, about a measure nobody had judged. It now reports once, and the
report says what is actually wrong.

It fires only where there is something to attest: a populated `## Measures` with no `### Posture`.

### The RACI table is read by column, with the system escape

```markdown
### RACI

| Concern | Handled by | R | A | C | I |
|---|---|---|---|---|---|
| settlement alerting | system — pagerduty svc-settle | — | — | — | — |
| manual reconciliation | **not automated** | ops-oncall | head-of-eng | finance | support |
```

A row whose **Handled by** names a system needs no names. A row that does not must carry R and A;
C and I are optional. That is `DEC-042`'s residue-after-automation rule, parsed.

Parsing is lenient on the dash forms that markdown tables collect — `—`, `-`, empty — and treats
all of them as absent.

### Parsing lands here, harvesting lands in milestone 12

This milestone makes the section readable and has the skill write it. The loops that report a
missing door, blast radius or owner come with the documentation milestone, because they are the
half that needs the configured docs directory to say where the answer should also be published.

## Risks / Trade-offs

**Reading tests moves the rationalisation risk rather than removing it.** `DEC-043` answers it by
refusing the authoring session, which is enforcement by instruction and acknowledged as weak. What
code can still check is the written output, which `DEC-027`'s bound already does.

**A lenient RACI parser accepts a malformed table silently.** Preferred to rejecting a table someone
wrote by hand in a hurry; milestone 12's `raci-unassigned` is where an under-filled table surfaces.

## Migration Plan

None. `### Posture` and `## Attestation` are both optional; a record or initiative without them
parses exactly as before.

## Open Questions

None blocking.
