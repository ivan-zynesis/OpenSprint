---
id: DS-BIG-PICTURE
type: product
status: active
created: 2026-09-27
hats: [product]
---

# DS-BIG-PICTURE: A Compiled View Is a Big Picture, Not an Index

## Statement

The compacted surrogate is **big-picture documentation**. A hat view conveys what someone wearing that hat needs to understand about the domain — it does not contain every working file of that hat.

Views **select**. A record may legitimately appear in no view at all, and that is not a defect.

## Rationale

The first implementation compiled every record assigned to a hat into that hat's view, which produced an index rather than a picture: a `dev` view enumerating sixteen decision records tells a reader nothing about what the system *is*.

Selection is the other half of compaction. The first pass condensed prose while preserving full coverage and measured only 2.9x against the raw record — a number that reflects the rendering rather than the idea. A view that omits what does not shape the picture is both smaller and more useful.

This also decides what each hat's shape is *for*. A section earns its place by conveying the domain, not by giving every record somewhere to live.

## Implications

- **No hat view enumerates its records.** Each hat's sections are chosen for what conveys its domain — see the per-hat shapes.
- **Completeness is not the check.** The records remain the source of truth and [[DECISION-MAP]] remains the full tree; the view is neither.
- **A view cannot be read as an inventory.** A reader asking "is everything here?" is asking the wrong artifact.
- **The provenance manifest is unaffected.** A section's inputs remain *every* record the hat owns, because any of them could change the picture — including ones the picture does not name.
- **Citation still binds.** [[DEC-009]] governs the claims a view does make. Records it stays silent about are simply not claimed upon.

## Non-Goals

- Guaranteeing that every record is reachable from some view
- Using view coverage as a measure of surrogate health
