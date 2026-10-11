## Why

Two findings, and the second explains the first.

**The bar is nowhere in the tools.** `docs/workflows.md` says *">> the BAR is written here. ex ante. <<"* at the propose stage. `/opsp:triage` tells the operator that `/opsp:propose` "writes the driver-specs, the ADRs, the milestones and the bar". `DEC-019` gives a measure a `### Bar` block; `DEC-038` fixes its form; `constraint-unmeasurable` fires on every goal without one.

`/opsp:propose` never mentions `## Measures`. Neither does `/opsp:driver`. The only workflows that instruct a `### Bar` are `/opsp:apply`, inside an escalation's proposed-record template, and `/opsp:migrate`, which backfills. The primary path creates driver-specs with no hats, no role and no measures — three guaranteed loops per record.

**And `DEC-HAT-HANDOFFS` misclassified `/opsp:repropose`**, recording it as borrowing `DEC-027`'s **amend** mode from `/opsp:attest`. If propose writes the bar as a matter of course, repropose restating it is not a borrowing.

## What Changes

- `/opsp:propose` and `/opsp:driver` write `hats`, `role` and a populated `## Measures` with the bar, in the template an agent copies
- Both carry the per-hat BDD form (`DEC-038`) and the bar anatomy labels
- Both say to ask rather than invent, and offer `- **Primary**: unstated` as the honest gap
- `DEC-BAR-AT-PROPOSE` reclassifies `/opsp:repropose` as `create` mode, and says why the Statement is still out of bounds
- `opsp-reideate-workflow`'s Purpose, left as an archive placeholder by the previous change

## Capabilities

### Modified Capabilities
- `opsp-driver-specs`: a driver-spec is born with its hat, role and bar
- `opsp-propose-workflow`: the bar is written at propose, ex ante

## Impact

- **A bar written during `/opsp:apply` is not ex ante.** It is written by `dev`, after work began, against an implementation already taking shape — the exact failure attestation exists to catch, one stage earlier where nothing catches it.
- **The misclassification created a false risk.** It produced a "this is a widening" caveat and a follow-up to run `checkAmendment` against repropose. Neither is needed: `checkAmendment` bounds a tool writing into a record it does not own, and repropose owns the record.
- **The guard that matters survives unchanged** — *a bar that got easier is a goal that moved*. That is about altitude, not write modes.
- **Existing records are not backfilled.** `constraint-unmeasurable` names them; `/opsp:migrate` exists for the shape change. Writing bars for them is attestation's business, not a migration's.
