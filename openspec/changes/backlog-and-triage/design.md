## Context

`DEC-034` makes backlog the persistence verb; `DEC-039` makes triage its own tool for explicitness rather than capability.

## Goals / Non-Goals

**Goals** — the two workflows, the worktree rule, and the surrounding tools updated.

**Non-Goals** — the `declined` state (already shipped), and any change to what propose produces.

## Decisions

### Backlog writes the initiative and nothing else

A premature driver-spec is a false claim something later depends on. An initiative claims nothing —
it records that someone is thinking about something. That is what makes `DEC-025`'s original
guardrail unnecessary: explore writes nothing, and the flush is deliberate.

### Backlog stops rather than offering to proceed

Explicitly: no "shall I propose this?". The next step happens when someone picks the item up,
possibly not today, and an offer at the moment of writing defeats the point of having a resting
state.

### Triage carries the decline, and the reason

`DEC-035` made `declined` terminal but not permanent. The reason matters more than the state: the
same proposal returns in six months, and one recorded line ends that conversation. The workflow
shows the shape of a good decline rather than describing it.

### Propose stops being able to duplicate

Given an initiative at `exploring`, propose fills it in and advances it. It does not write a second,
and it does not rewrite an Objective or Goal that was settled at backlog time by someone possibly
wearing a different hat.

## Risks / Trade-offs

**Two more workflows on a surface that already has sixteen.** Justified by `DEC-039`'s reasoning: a
phase that exists in practice and has no name is a phase nobody reasons about. The cost is real and
was accepted when the decision was taken.

**Abandoned stubs accumulate in `initiatives/`.** Accepted at `DEC-025`'s supersession and partly
addressed by `declined`; the board filters by state.

## Migration Plan

None. Both paths stay open — `explore → propose` still works for work that never rests.

## Open Questions

None blocking.
