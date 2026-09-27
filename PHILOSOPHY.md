# Where OpenSprint Came From

> **This is history, not current documentation.**
>
> It records what the project set out to do and why, written before any of it was built. Its
> claims are left standing as what was believed at the time, including the ones that later moved.
>
> **For what OpenSprint is now**, read [`opensprint/squad/index.md`](opensprint/squad/index.md) —
> compiled from the records, and unable to drift from them.

---

## The premise, which has not changed

**Code became cheap.**

That was the observation the project started from, and everything else followed. If an agent can
write the code, the bottleneck moves to deciding what to write and why. The hard part stops being
implementation and becomes intent, judgement and memory:

- Why was this built this way?
- What alternatives were rejected?
- What constraints drove this?
- Could we rebuild it differently without losing the original reasoning?

The claim was that these should all be answerable by design rather than by archaeology, because
**reasoning is the most valuable engineering artifact that is routinely thrown away.** Code can be
regenerated. Tests can be rewritten. But *why this approach and not that one*, once lost, gets
rediscovered the hard way — usually during an incident or a failed rewrite.

That premise held. It is now recorded as [`DS-AGENTIC-SDLC`](opensprint/driver-specs/DS-AGENTIC-SDLC.md),
and the phrasing there is nearly the same.

---

## What was inherited, and what was argued with

OpenSpec established five principles. The project took the first two, diverged on the third, and
reframed the last two.

```
OpenSpec                    became
────────                    ──────
fluid, not rigid            fluid, not rigid                  unchanged
iterative, not waterfall    iterative, not waterfall          elevated to initiatives
easy, not complex           clear, not simple                 argued with
built for brownfield        navigable, not hidden             reframed
scalable to enterprises     enterprise-intuitive              reframed
                          + reasoned, not assumed             added
```

The divergence on *easy, not complex* was the load-bearing one. OpenSpec optimised for a gentle
learning curve, which is right for a single-change workflow. The argument here was that
multi-domain systems are **inherently** complex, and that hiding complexity is not the same as
handling it:

```
Simple:    hide the complexity, hope it doesn't matter
Clear:     show the complexity, make it navigable
```

---

## How the six principles held up

Judged against the objective the project eventually recorded, three years of intent compressed
into about one year of building:

### Held unchanged

**Fluid, not rigid.** No mandatory ceremony where a shortcut is safe. This survived contact with
everything — the hat set is per-project, sections are configurable, an unknown hat falls back
rather than failing.

**Reasoned, not assumed.** Every decision carrying its rationale is what the whole surrogate is.
It is now enforced rather than encouraged: a compiled claim must cite the record it came from, and
one that cannot be traced does not belong in a view.

**Iterative, not waterfall.** Still true, and the initiative-level framing held.

### Needed reframing

**Navigable, not hidden** was written about the decision tree — *where am I, how did we get here,
what's next*. It assumed a human doing the navigating. The primary reader turned out to be an
agent, and navigability for an agent is a different property: not a map you can follow, but a
context small enough to load and precise enough to act on. That became
[`DS-SURROGATE-BUDGET`](opensprint/driver-specs/DS-SURROGATE-BUDGET.md) — measured across real
projects rather than asserted, and the figures live there rather than here, because they move.

**Enterprise-intuitive, not enterprise-complicated** aimed at scale: *enterprise engineering
should feel as intuitive as a personal project*. The framing was right and the mechanism was
missing. What supplied it was not a better mental model but a division of accountability —
product, maintainer, dev, devops — where one person may wear several and an agent must be told
which it is wearing. That became
[`DS-SQUAD-HATS`](opensprint/driver-specs/DS-SQUAD-HATS.md).

### Answered by the work

**Clear, not simple** was an argument. It got settled by building the thing, and the answer was
more specific than the principle.

Clarity is not achieved by showing everything in an organised way — the first compaction did
exactly that, rendering every record into its hat's view, and produced an index nobody would read.
Clarity came from **selection**: a view conveys what someone wearing that hat needs, and a record
that does not shape the picture does not appear. Completeness stopped being the goal, and the
records remained the source of truth underneath.

That is [`DS-BIG-PICTURE`](opensprint/driver-specs/DS-BIG-PICTURE.md), and it is a narrower claim
than *clear, not simple* ever made.

---

## What the project did not anticipate

Three things emerged from building that were not in the original thinking.

**Specification has four faces, not one.** The early framing treated specs as one thing. It is two
— functional intent and non-functional intent — and what gets delivered is also two — application
and infrastructure. A practice covering only the first of each is half a system, and that is most
of what spec-driven development means in common use. Recorded as
[`DS-FULL-COVERAGE`](opensprint/driver-specs/DS-FULL-COVERAGE.md).

**Documentation is an output, not a task.** The original text did not mention documentation at
all. It turns out to be a large part of engineering and to fail structurally rather than through
indiscipline — written after the fact, by someone with no remaining incentive, about reasoning
that has already faded. Compiling it removes the second effort entirely. Recorded as
[`DS-DOCUMENTATION-AS-OUTPUT`](opensprint/driver-specs/DS-DOCUMENTATION-AS-OUTPUT.md).

**The loop has four arrows and only three were being built.** Constraint to decision, decision to
implementation — those were the original scope. What was missing was *implementation to rule*, and
then the rule failing back to the constraint. Without that last arrow a process produces
documents; with it, drift becomes a build failure. Recorded as
[`DS-LOOP-CLOSURE`](opensprint/driver-specs/DS-LOOP-CLOSURE.md).

---

## On OpenSpec

Nothing here is a correction of OpenSpec.

Running a quick change against a brownfield project is what OPSX does, and it still does it well.
OpenSprint made a larger claim — that the same discipline, applied across every accountability a
team carries, produces an engineering organisation that agents can participate in without the
reasoning being lost.

Different ambition, same premise.

---

*Written 2026. Superseded as a statement of current intent by the records under
[`opensprint/`](opensprint/), which are compiled into
[`opensprint/squad/`](opensprint/squad/) and cannot disagree with them.*
