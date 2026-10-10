---
id: DEC-COMPILE-ON-MILESTONE
type: adr
status: active
created: 2026-10-10
depth: 3
depends-on:
  - DS-VIEW-AUTHORSHIP
  - DEC-SCOPED-SEAL
  - DEC-031
hats: [dev, devops]
---

# DEC-COMPILE-ON-MILESTONE: Apply Compiles at Each Milestone Boundary, Bounded to the Hat Present

## Question

`dev` and `devops` views move on the code clock and are compiled only at archive, leaving them stale
for an entire initiative. When should they be recompiled, and by whom?

## Decision

**At each milestone boundary inside `/opsp:apply`**, after the change branch merges into the
initiative branch:

```
  compact plan                  which sections moved
  filter to dev + devops        the only hats in the room
  render those                  continuous condensation
  compact seal --hat dev …      scoped (DEC-SCOPED-SEAL)
```

**Only sections `plan` reports stale.** A milestone that touched no manifest leaves `tech-stack`
fresh and renders nothing.

**Only `dev` and `devops`.** Product and maintainer are not compiled here, even when stale — their
compilation during apply requires an approved escalation ([[DEC-COMPILE-ON-APPROVAL]]).

## Consideration Factors

| Factor | Weight | Milestone boundary | Archive only (today) | On demand | In CI |
|---|---|---|---|---|---|
| View is current when read | HIGH | At most one milestone behind ✓ | A whole initiative behind ✗ | In practice never ✗ | ✓ |
| An author with the hat is present | HIGH | The dev agent ✓ | ✓ | Varies ✗ | **Nobody** ✗ |
| Rendering needs a model | HIGH | Agent is already there ✓ | ✓ | ✓ | **Impossible** ✗ |
| Cost | MED | Only stale sections ✓ | Lowest ✓ | ✓ | — |
| Operator effort | LOW | None — apply does it ✓ | ✓ | Must remember ✗ | ✓ |

## Rationale

The milestone boundary is the only moment that satisfies every constraint at once: the code has just
changed, an agent holding the `dev` hat is already present, and the next milestone will read what is
produced. Archive satisfies the authorship requirement but arrives a whole initiative too late.

CI is ruled out by the deterministic/synthetic split. Rendering a view is synthesis and needs a
model; a pipeline has no agent, and no hat.

"On demand" already works today — `/opsp:compact` is invocable at any time — and in practice means
never, which is the same failure documentation had before it was reviewed at attestation.

The cost is bounded by machinery that already exists. [[DEC-010]] computes staleness per section, so
a milestone that changed no observed file and produced no new ADR renders nothing at all.

[[DEC-031]] is unaffected: archive still consumes the compile, and still compiles everything. This
adds a second, narrower occasion rather than moving the first.

## Invalidation Trigger

If milestone-boundary compilation routinely renders nothing because dev/devops sections rarely go
stale within an initiative, the clock separation is weaker than claimed and archive-only was
adequate. If it routinely renders *everything*, milestones are too large for the section
granularity [[DEC-010]] provides.
