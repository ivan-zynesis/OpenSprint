---
id: DEC-COMPILE-ON-APPROVAL
type: adr
status: active
created: 2026-10-10
depth: 1
depends-on:
  - DS-VIEW-AUTHORSHIP
  - DS-ESCALATION-HANDOFF
  - DEC-ESCALATION-IS-A-STAGE
hats: [dev]
---

# DEC-COMPILE-ON-APPROVAL: An Approved Escalation Permits Compiling the Affected Hat's View

## Question

[[DEC-COMPILE-ON-MILESTONE]] bounds apply to compiling `dev` and `devops`. An escalation can change
a `product` or `maintainer` record. Does that view stay stale until archive, or may apply compile it?

## Decision

**It may compile it — but only on explicit approval, and only the hat the escalation touched.**

The condition [[DS-VIEW-AUTHORSHIP]] requires is an accountable author who is present and approving.
During an approved escalation the operator **is** the product or maintainer hat: named, answering,
and consenting to a stated blast radius. That is the condition, met.

Three bounds:

- **Only the hat the escalation was classified into.** A product escalation does not license
  recompiling maintainer.
- **Only on approval.** A declined or deferred escalation changes nothing and compiles nothing.
- **Only what `plan` reports stale**, sealed scoped ([[DEC-SCOPED-SEAL]]).

## Consideration Factors

| Factor | Weight | Compile on approval | Leave stale until archive | Compile whenever stale |
|---|---|---|---|---|
| An accountable author is present | HIGH | By definition ✓ | — | **No** ✗ |
| The view matches the record | HIGH | Immediately ✓ | Lags an initiative ✗ | ✓ |
| Dev-flavoured product prose | HIGH | Impossible — operator approved ✓ | Impossible ✓ | **Likely** ✗ |
| Rule complexity | MED | One condition, uniformly applied ✓ | Simplest ✓ | Simple but wrong ✗ |
| Approval fatigue | LOW | One more thing to approve ✗ | ✓ | ✓ |

## Rationale

The earlier framing of this was that an escalation touching product is a *consequence to tolerate* —
the view goes stale and archive catches it. That was wrong, and the correction matters: a spec that
does not cover everything is the normal case, and the escalation is the lifecycle working rather
than apply overstepping ([[DS-ESCALATION-HANDOFF]]).

Once that is seen, this decision is not an exception to [[DS-VIEW-AUTHORSHIP]] — it is the same rule
applied honestly. The rule was never "apply may only compile dev and devops". It is "a view needs an
author who holds that hat", and during an approved escalation that author is in the room.

Scoping to the hat the escalation touched preserves the rest of the rule: the operator wore
`product` for that question and said nothing about maintainer's bars.

The accepted cost is one more approval in a flow that already has several. It is worth it because
the alternative — recompiling because something is stale, with no one accountable present — is the
silent drift the whole driver-spec exists to prevent.

## Invalidation Trigger

If operators approve escalations without reading the blast radius, the approval is not real and this
decision is compiling product views on a reflex. If a single escalation routinely restages most of
the product view, the records are too coarsely sectioned for [[DEC-010]]'s granularity to help.
