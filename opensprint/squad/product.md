# product — what must it do?

## Charter

**Owns** the functional constraints: what OpenSprint must do for the operator and for downstream
projects consuming it (`DS-SQUAD-HATS`). This is a highly technical product, so its requirements
read technically — that does not make them engineering decisions.

**May not trade away:**
- The accountabilities themselves. Hats group however team size demands; what each one answers
  for does not move (`DS-SQUAD-HATS`).
- Single ownership per hat. A hat with two owners has none (`DS-SME-OWNERSHIP`).
- Closing the loop. A process whose last arrow is missing produces documents (`DS-LOOP-CLOSURE`).

**Escalates when** a constraint is written so that nothing can check it — a constraint nothing can
assert was written badly, and that bridging work lands on this hat (`DS-SQUAD-HATS`).

**The owner** reviews every change to this view, receives escalations in its domain, and triages
its open loops as backlog (`DS-SME-OWNERSHIP`).

## Constraints

### The squad is four hats, and one person may wear all of them

Accountability partitions into **product** (what it must do), **maintainer** (what must be true of
it), **dev** (how it is built) and **devops** (how it is run) (`DS-SQUAD-HATS`). A hat is a context
boundary: wearing it means knowing what that role answers for, what it produces, and which
constraints it may not trade away. An agent must be told which one it is wearing.

Two hats produce driver-specs in one format. A constraint is a constraint whether it reads
"multiple payment rails with divergent semantics" or "99.9% monthly" (`DS-SQUAD-HATS`).

**QA is redistributed, not absent.** Engineers write the tests, because the person who can most
cheaply make something verifiable is the person building it. But *what must be tested* is answered
upstream by the driver-specs, so the bridge between specification and assertion lands mostly on
product and maintainer (`DS-SQUAD-HATS`).

**Designer is product-dependent** and the hat set is therefore per-project, not a fixed list
(`DS-SQUAD-HATS`, `DEC-012` as superseded by `DEC-016`).

**Hats are an ownership partition, not a loading filter.** Measured against cashier's six
initiatives, four touch all four hats and none touches fewer than two (`DS-SQUAD-HATS`). Real work
spans them — which is why one person wears all of them.

### Every hat needs one human owner

Laying the hats out as distinct artifacts is what makes ownership assignable (`DS-SME-OWNERSHIP`).
A condensed view is in effect a surrogate of the person holding that expertise, and a surrogate
nobody is accountable for drifts without anyone noticing.

Ownership means **reviewer**, **escalation target** and **triage owner** — not author. The owner
owns the system's behaviour in their domain, not a document describing it (`DS-SME-OWNERSHIP`,
`DEC-006`). In a one-person team all four owners are the same engineer on different days; the
accountabilities still do not move.

### The loop must close mechanically

`driver-spec → ADR → implementation → rule → back to the constraint` (`DS-LOOP-CLOSURE`). Each
arrow is a skill or a hook rather than a meeting. Facilitation — noticing that a constraint has no
decision, that a decision was never implemented, that an implementation drifted — is the role an
AI-native team does not fill with a person, because it is exactly the part that can be encoded.

**The last arrow is the one that matters.** Without it a process produces documents; with it,
drift becomes a build failure rather than an archaeology exercise (`DS-LOOP-CLOSURE`).

The compacted surrogate is itself subject to this: it must not be able to disagree silently with
the record it derives from (`DS-LOOP-CLOSURE`, `DEC-010`).

### Loading the surrogate must not consume the session budget

Measured across projects in production use, loading costs **93–157K tokens**: cashier ~106K for
apply and ~157K for explore, overheard ~94K/~129K, ai-gateway ~93K/~127K (`DS-SURROGATE-BUDGET`).

Three facts drive it (`DS-SURROGATE-BUDGET`):
- **ADRs are 61–74% of every load** — that is the layer worth condensing
- **`architecture.md` is loaded alongside the ADRs it summarises**, so today's compaction saves
  nothing at load time; it works as documentation, not as a surrogate layer
- **Completed initiatives are loaded on every explore** — roughly 47K of cashier's 157K — although
  their durable output already lives in the driver-specs and ADRs

Progressive discovery must therefore extend one layer further: an agent works from the compacted
surrogate rather than the full record set. Condensation earns the tokens; how the output is
partitioned is a separate question (`DS-SURROGATE-BUDGET`, `DS-SQUAD-HATS`). An agent that *acts*
on a decision still reads that decision's full record — the budget is saved on orientation, not on
judgement (`DS-SURROGATE-BUDGET`, `DEC-015`).

### Initiatives run concurrently, in independent universes

Initiatives must support concurrent execution across independent git worktrees, each carrying its
own surrogate and evolving independently, with no shared mutable state during execution
(`DS-PARALLEL-EXEC`). Serial execution is insufficient when a redesign and a maintenance
initiative should not block each other.

Parallel universes will diverge in ADRs, driver-specs and architecture.md over time, so
reconciliation is required when they converge or one wins (`DS-PARALLEL-EXEC`).

### Reconciliation is operator-invocable only

Universe reconciliation is high-impact and difficult to reverse. It must never be triggerable by
an automated pipeline, a sub-agent, or another skill invoking it programmatically
(`DS-HIGH-IMPACT-OPS`).

A corrupted surrogate degrades every downstream agent operation that depends on it; the blast
radius is unbounded. Human confirmation at each ambiguous step is non-negotiable
(`DS-HIGH-IMPACT-OPS`). A planning phase with operator confirmation must precede all execution,
and the most capable available model with extended thinking is recommended.

### A self-use tool, deliberately not competing

Tech giants and LLM providers could release tooling that does this better. **We do not intend to
compete** (`DS-SELF-USE-SCOPE`). OpenSprint exists to be evolved quickly for our own use, kept
well documented, and to give stakeholders maximum visibility into a well-organised agentic SDLC.

Competing on feature parity with a provider that owns the model would set the roadmap by someone
else's release schedule. Open source is a consequence of building in the open, not a bid for
market share (`DS-SELF-USE-SCOPE`).

What follows: no GUI, no CI/CD of its own, an empty `devops` hat that a compiled view should
report honestly, and speed of evolution beating feature parity where the two conflict
(`DS-SELF-USE-SCOPE`, `DEC-017`).

## Decisions

None assigned to this hat. Every recorded decision belongs to `dev` — see
[dev.md](dev.md).

## Open Loops

**Harvested** (`DEC-013`):

- `constraint-unasserted` **DS-SELF-USE-SCOPE** — answered by `DEC-017`, which no rule cites.

`DS-LOOP-CLOSURE` was on this list until a test named `DEC-007`, one of its three answering
decisions. Transitive coverage closed it with nothing marking it resolved (`DEC-013`).

**Structural:**

- **No charter record.** The charter above is assembled from `DS-SQUAD-HATS` and
  `DS-SME-OWNERSHIP`, which describe the model in general rather than this hat's boundary in this
  project. Nothing records what product specifically may not trade away here.
- **Seven constraints, no decisions.** Every ADR routes to `dev`, so this hat's constraints are
  answered in another hat's view.
