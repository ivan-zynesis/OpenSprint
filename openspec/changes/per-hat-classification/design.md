## Context

`hats` already demonstrates the shape this needs: an explicit field on the record, validated by list lookup against a per-project registry, backfilled with owner confirmation batched by area. `DEC-012` made the argument for why inference from an existing field cannot work, and `DEC-016` settled that the registry is per-project.

The re-exploration settled that OGSM is a causal chain — objective, therefore goal, therefore strategy — and that it is independent of `DECISION-MAP` because the two operate on different record types. The decision map is the ADR layer; OGSM structures the driver-spec layer above it.

## Goals / Non-Goals

**Goals:**
- Record a driver-spec's role within its hat, and its relationship to other driver-specs
- Keep the mechanism general — roles are configuration, so maintainer and devops need no further code
- Surface unclassified records so the backfill is visible rather than assumed complete

**Non-Goals:**
- Rendering the OGSM chain. That is `hat-templates`.
- Changing `DECISION-MAP`. It builds from decision `depends-on`; driver-spec edges are a different layer and it will not traverse them.
- Enforcing OGSM's causal ordering — that a `goal` may only depend on an `objective`. Tempting, and premature: the shape has never been used on real records, and a rule that rejects a legitimate arrangement on day one teaches people to stop recording edges.
- `measure` as a role. It is a property of a goal, not a node. Making it a role would invite measures to be filed as their own driver-specs, which is the asymmetry `hat-templates` has to state anyway.

## Decisions

**The field is `role`, not `kind` or `type`.** `type` is taken and means something else on driver-specs; `kind` says nothing about what it is for. A role is what a record does within its hat, which is exactly the classification being recorded.

**Roles are declared per hat, like sections.** `product` defaults to `objective | goal | strategy`; every other hat defaults to none, meaning its records are unclassified and nothing reports them as missing. A hat that declares no roles has nothing to classify against, so `record-unclassified` cannot fire for it.

```yaml
hats:
  product:
    roles: [objective, goal, strategy]
  maintainer:
    roles: [bar, posture, evidence]      # a project's own, needing no code
```

**Driver-specs use `depends-on`, the same field name as ADRs.** Not `supports` or `parent`. The relationship is identical in meaning — this exists because of that — and inventing a second name for it would mean two parsers, two validations, and a reader having to learn which layer uses which word.

**Edges are validated, not constrained.** A driver-spec's `depends-on` must reference an existing driver-spec, and the graph must be acyclic. Both are mechanical and both catch real mistakes. What is *not* checked is whether the edge respects OGSM's causality, because no project has yet recorded one and a premature rule would reject arrangements we have not seen.

**A cycle degrades to no edges for the records involved, and warns.** Not a thrown error. A cycle is a mistake in a record, and the correct response is to report it and carry on compiling everything else — the same stance `readProjectConfig` takes toward a malformed field.

**`record-unclassified` fires only where a hat declares roles.** Otherwise every project without OGSM would see its entire surrogate reported as a backlog of unclassified records on first run, which is noise rather than a gap.

## Risks / Trade-offs

**Two optional fields with no enforcement is a weak guarantee.** A project can carry roles on half its records and edges on none. Accepted: `record-unclassified` makes the first visible, and an edge nobody records is the status quo rather than a regression.

**`depends-on` on a driver-spec could be mistaken for the decision map's edges.** Mitigated by the map's behaviour — it builds from decisions only, so a driver-spec edge cannot appear there by accident. The two layers stay visibly separate.

**Cross-platform.** No paths. Role and id comparisons are case-sensitive string lookups, as hat names already are.
