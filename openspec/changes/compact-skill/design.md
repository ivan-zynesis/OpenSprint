## Context

The engine reports sections as `fresh`, `stale`, `tampered` or `unsealed`, and names the records feeding each. `DEC-009` requires every compiled claim to carry its record ids inline. `DEC-011` requires a stale section to be re-rendered from its full input set rather than from its previous rendering. `DEC-006` makes views read-only to everyone but compact.

`/opsp:archive` currently compiles `architecture.md` itself, with its own section list and its own synthesis instructions. That predates `DEC-014`.

## Goals / Non-Goals

**Goals:**
- Views good enough to judge whether the condensed surrogate is worth reading instead of the records
- Rendering that cannot silently drift, because every claim names its source
- One compile engine, called from every skill that needs one

**Non-Goals:**
- Changing what `/opsp:explore` or `/opsp:apply` load. That is deliberately deferred (`DEC-015`); this change produces the views, it does not switch the read path.
- Rule harvesting. `open-loops` in this change reports only what the engine already knows — unassigned records, unknown hats, and hats with no records. Gaps between decisions and rules are milestone 3 (`DEC-013`).
- A `--fix` mode. Rendering needs a model, so it belongs to the skill, not to the gate.

## Decisions

**The skill renders; the CLI verifies.** The skill's loop is plan, read, render, seal. It never computes staleness itself and never writes the manifest by hand — both come from the engine, so the gate and the renderer cannot disagree about what is fresh.

**A stale section is re-rendered from its records, never from what the view previously said.** `DEC-011`. The skill is instructed to read the input files named by the plan and to treat the existing view text as output, not input. This is the instruction that keeps a twentieth compile one hop from the record rather than twenty.

**Every claim carries its record ids inline.** `DEC-009`. Stated as a hard requirement of the format rather than a style preference, with the `DEC-062`/`DEC-064` partial-supersession case given as the worked reason: a claim citing only the superseded record is visibly incomplete, where an uncited claim is silently wrong.

**`open-loops` reports only what is mechanically known.** Unassigned records, records declaring an unknown hat, and hats in the registry with no records at all. The skill is explicitly forbidden from inventing gaps, because an invented gap in a backlog (`DEC-007`) costs someone a triage conversation about nothing.

**Tampered sections stop the run.** If the plan reports `tampered`, the skill presents the affected views and stops rather than overwriting. A hand edit is a signal that someone believed the view was wrong; overwriting it destroys the only evidence of what they thought. Per `DEC-006`, the answer is `/opsp:explore`, which is what the skill directs them to.

**`index.md` is a router, not a summary.** It carries the hat table, which hat owns which question, per-hat record counts, and where to drill down. `DS-SURROGATE-BUDGET` measured that hats do not partition the loading — four of six cashier initiatives touch all four hats — so the index's job is orientation, not filtering.

## Risks / Trade-offs

**A skill cannot be unit-tested the way the engine can.** Tests assert registration, naming and that the load-bearing guardrails are present in the instruction text — the same standard the rebase and abandon skills are held to. Whether the rendered prose is good is judged by reading the first real views, which is why milestone 2 ends here rather than at the engine.

**Archive changes behaviour.** It stops compiling `architecture.md` in its own words and calls compact instead. The output will differ from what archive produced before. That is the point of `DEC-014`, but it is a visible change to a workflow that already ran on real projects, so the archive spec is updated in this change rather than left to drift.

**Cross-platform.** The skill instructs the agent to construct every path with `path.join`, and the view paths come from the engine rather than being assembled in the instruction text.
