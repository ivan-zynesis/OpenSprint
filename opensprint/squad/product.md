# product — what must it do?

## Charter

**Owns** the functional intent: what OpenSprint must do for the operator, the agent and the
downstream project (`DS-SQUAD-HATS`). A highly technical product still has product requirements;
they just read technically.

**Owns the objective and what follows from it.** The records here are classified as a chain —
objective, then goals, then strategies (`DS-AGENTIC-SDLC`). Deciding what OpenSprint will *not* do
is part of that (`DS-SURROGATE-SCOPE`), as is deciding what a compiled view is for
(`DS-BIG-PICTURE`).

**May not trade away:** coverage of all four accountabilities (`DS-FULL-COVERAGE`); documentation
being compiled rather than authored (`DS-DOCUMENTATION-AS-OUTPUT`); single ownership per hat
(`DS-SME-OWNERSHIP`).

**Escalates when** a constraint is written so that nothing can check it — the bridging work
`DS-SQUAD-HATS` assigns to this hat.

## Constraints

### Objective — power an entire engineering team, human or agent

Software development becomes real engineering only when the detail across **dev, sec and ops** is
all taken care of. OpenSprint exists to power a whole engineering team at that standard,
regardless of whether the participants are human or agent, at a scale beyond a single change
workflow (`DS-AGENTIC-SDLC`).

The premise has not changed since the project began: **code became cheap.** Connecting context and
building the knowledge base are the load-bearing activities now. Where every detail of the context
is recorded, rebuilding a whole application from it is easy — generating the code was never the
hard part (`DS-AGENTIC-SDLC`).

This is a different ambition from OpenSpec's rather than a correction of it. A quick change against
a brownfield project is well served by OPSX. OpenSprint is the larger claim, and the move is
deliberately away from vibe coding — not because generating code fast is wrong, but because a
system nobody can explain is not engineered, whoever wrote it (`DS-AGENTIC-SDLC`).

### Goal — cover all four accountabilities

Specification must cover **functional** intent (product) and **non-functional** intent
(maintainer); delivered results must cover **application** (dev) and **infrastructure** (devops).
A practice covering only some of those is not engineering (`DS-FULL-COVERAGE`).

Spec-driven development as commonly practised covers the product and dev hats — half a system.
What must remain true while it runs, and how it is stood up, are left to convention. That gap is
why an implementation can satisfy every stated requirement and still be unfit: nothing stated the
availability bar, or the compliance obligation, or the topology that follows from either
(`DS-FULL-COVERAGE`).

Measured by: every hat in a project's registry has records, or a recorded decision explaining why
not; and no hat accumulates records nothing asserts (`DS-FULL-COVERAGE`, `DS-LOOP-CLOSURE`).

### Goal — documentation is compiled, never a second effort

The compacted surrogate **is** the documentation, compiled from work already done rather than
authored alongside it (`DS-DOCUMENTATION-AS-OUTPUT`).

Documentation fails structurally rather than through indiscipline: it is written after the fact,
by someone with no remaining incentive, about reasoning that has already faded. Compiling removes
the second effort entirely — the records are made *during* the work because the work cannot
proceed without them (`DS-DOCUMENTATION-AS-OUTPUT`).

It also makes the artifact honest. A compiled document cannot drift from what it describes without
the compile reporting it, which no authored document has ever guaranteed
(`DS-DOCUMENTATION-AS-OUTPUT`, `DEC-010`).

### Goal — loading the surrogate must not consume the session budget

Measured across projects in production use: **93–157K tokens**, of which ADRs are 61–74%
(`DS-SURROGATE-BUDGET`). `architecture.md` is loaded alongside the ADRs it summarises, so today's
compaction saves nothing at load time; completed initiatives add ~47K of cashier's 157K although
their durable output already lives in the records.

Progressive discovery must therefore extend one layer further. An agent that *acts* on a decision
still reads its full record — the budget is saved on orientation, not on judgement
(`DS-SURROGATE-BUDGET`, `DEC-015`).

### Strategy — four hats, and the accountabilities do not move

Accountability partitions into **product**, **maintainer**, **dev** and **devops**
(`DS-SQUAD-HATS`). A hat is a context boundary: wearing it means knowing what that role answers
for and which constraints it may not trade away. An agent must be told which one it wears.

QA is redistributed rather than absent — engineers write the tests, but *what* must be tested is
answered upstream by the driver-specs, so the bridge lands on product and maintainer. Designer is
product-dependent, so the hat set is a per-project registry (`DS-SQUAD-HATS`, `DEC-016`).

Hats are an ownership partition, not a loading filter: four of cashier's six initiatives touch all
four hats (`DS-SQUAD-HATS`).

### Strategy — the loop must close mechanically

`driver-spec → ADR → implementation → rule`, and back to the constraint when a rule fails
(`DS-LOOP-CLOSURE`). Each arrow is a skill or a hook rather than a meeting. Facilitation — noticing
a constraint has no decision, or an implementation has drifted — is the part that can be encoded.

**The last arrow is the one that matters.** Without it a process produces documents; with it, drift
becomes a build failure rather than an archaeology exercise (`DS-LOOP-CLOSURE`).

### Strategy — one human owner per hat

Ownership means **reviewer**, **escalation target** and **triage owner** — not author
(`DS-SME-OWNERSHIP`). A condensed view is in effect a surrogate of the person holding that
expertise, and one nobody is accountable for drifts unnoticed. In a one-person team all four
owners are the same engineer on different days; the accountabilities still do not move.

### Strategy — a view is a big picture, not an index

A hat view conveys what someone wearing that hat needs to understand. It does not contain every
working file of that hat, and **views select** — a record may appear in no view without that being
a defect (`DS-BIG-PICTURE`).

The first implementation compiled every record into its hat's view, producing an index rather than
a picture, and measured only 2.9x against the raw record. Selection is the other half of
compaction (`DS-BIG-PICTURE`, `DS-SURROGATE-BUDGET`).

### Strategy — initiatives run concurrently, in independent universes

Concurrent execution across independent git worktrees, each carrying its own surrogate, with no
shared mutable state during execution (`DS-PARALLEL-EXEC`). Serial execution is insufficient when a
redesign and a maintenance initiative should not block each other. Universes diverge, so
reconciliation is required when they converge or one wins.

### Strategy — compaction stops at the surrogate

Certification, change management and release management are deliberately out of scope
(`DS-SURROGATE-SCOPE`). Each is a plausible next step that pulls in a domain of its own:
certification looks small, but a signature only means something if something governs what happens
when it is withheld — which is change management, and then release management. One artifact drags
in two disciplines.

So compaction renders and reports; it does not approve, gate or promote.

## Decisions

None assigned to this hat. Every recorded decision belongs to `dev` — see [dev.md](dev.md).

## Open Loops

**Harvested** (`DEC-013`):

- `constraint-unanswered` **DS-AGENTIC-SDLC**, **DS-FULL-COVERAGE**,
  **DS-DOCUMENTATION-AS-OUTPUT** — the objective and both goals were recorded on 2026-09-27 and no
  decision answers any of them yet. Expected for records this new; a real gap if it persists.
- `constraint-unanswered` **DS-SURROGATE-SCOPE** — a scope boundary with no decision behind it.
- `constraint-unasserted` **DS-SELF-USE-SCOPE** is no longer this hat's; it moved to
  [maintainer.md](maintainer.md) as a posture.

**Structural:**

- **No charter record.** The charter above is assembled from the strategies rather than from a
  record stating this hat's own boundary.
- **Ten records, no decisions.** Every ADR routes to `dev`, so this hat's constraints are answered
  in another hat's view — the intended shape (`DS-SQUAD-HATS`), but it means no view is
  self-contained.
