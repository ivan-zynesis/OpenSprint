# dev — how is it built?

## Charter

**Owns** the architectural decisions: how OpenSprint is built, given what product and maintainer
say it must do and must remain (`DS-SQUAD-HATS`). Every recorded decision in this project belongs
to this hat.

**May not trade away:**
- The record as source of truth. Views are derived; if a view is wrong, the system is wrong
  (`DEC-006`).
- Conservative reconciliation. Only purely additive, high-confidence changes auto-accept; all
  ambiguity escalates (`DEC-002`).
- Rebuilding from the record. A derived artifact is one hop from its source, never a chain of
  re-summaries (`DEC-011`, `DEC-014`).

**Escalates when** a decision cannot be answered from the existing record — reformulated as an
architectural question, so the answer enriches the record rather than being consumed by one task.

## Decisions

### The compacted surrogate

**Views are compiled artifacts, never hand-edited** (`DEC-006`). Not the body, and not the charter
(`DEC-008`). A view honestly shows the current state; when a flaw is found, the flaw is in the
system, and the fix path is `/opsp:explore` into `/opsp:propose` (`DEC-006`, `DEC-007`).

The reasoning is attribution and blast radius. A compiled section synthesises many records, so an
edit to one sentence has no unambiguous home; and a view that can be edited becomes a second
source of truth the moment someone edits it (`DEC-006`). Because compact never mutates the record
and every view regenerates, it cannot corrupt the surrogate the way `DEC-002` guards against — so
compact does **not** carry the operator-only guardrail that `/opsp:rebase` and `/opsp:abandon`
carry under `DS-HIGH-IMPACT-OPS` (`DEC-006`).

**Open loops are the backlog; `/opsp:explore` → `/opsp:propose` is the triage** (`DEC-007`). No new
mechanism acts on an open loop. Facilitation has two halves — noticing, and deciding what to do —
and only the first can be encoded. This is why rule harvesting is worth building: its output is
backlog generation, not a report (`DEC-007`, `DEC-013`).

**The charter compiles too, from governance records** (`DEC-008`). To change what a hat owns,
record a decision. A project with no governance records gets a thin charter, which is the honest
report that ownership has not been decided. Cashier's CODEOWNERS, derived from blast radius the
decision map already computes, is charter content recorded as a decision (`DEC-008`).

**Every compiled claim carries its record ids inline** (`DEC-009`) — a format requirement, not a
nicety. The load-bearing case is partial supersession: cashier's `DEC-064` ends one clause of its
`DEC-062`, so a summary built from `DEC-062` alone states that production is single-AZ, which
stopped being true. Cited inline, a section naming only the older record is *visibly* incomplete;
uncited, it is silently wrong (`DEC-009`).

**Two-state provenance manifest, enforced by `--check`** (`DEC-010`). Per hat and per section: the
record ids and content hashes compiled from, plus a hash of the rendered output. Inputs changed →
stale, recompile from full inputs. Output changed → tampered, and the message says the edit will
be lost and points at `/opsp:explore`. Content hashes rather than a git SHA, because a SHA does
not survive squash-merge, is unresolvable in a shallow CI clone, and diverges per branch across
universes (`DEC-010`, `DEC-001`).

**Recompile stale sections from full inputs, never summary-plus-delta** (`DEC-011`). The delta
decides *which* sections are out of date; each is re-rendered from its complete input set, and the
previous rendering is never an input. Same reasoning as building an image once and promoting by
digest: the trusted artifact must be traceable to its source in one hop. Propagation across the
tree is deliberately not handled by re-rendering — a superseded ancestor flags its descendants as
open loops pointing at `/opsp:rebuild-assess` (`DEC-011`).

**A record declares one or more hats; there is no `agreements` hat** (`DEC-016`, superseding
`DEC-012`). The single-hat rule had required a fifth hat to hold cross-cutting constraints, and six
of this repository's twenty-one records routed there — none with an owner, which is what
`DS-SME-OWNERSHIP` requires a hat to have. The original objection, that a record with two owners
has none, conflated two things: ownership attaches to the hat *file*, so a record in two views is
reviewed by both owners, which for a genuinely cross-cutting constraint is correct (`DEC-016`).

The field is `hats`, accepting a bare string or a list. The registry is per-project, because the
hat set is a property of the product (`DEC-016`, `DS-SQUAD-HATS`). The existing `type` field could
not carry this: across four projects it means four different things (`DEC-012`).

**Rule links are harvested from code, not declared in records** (`DEC-013`). A rule cites the record
it guards; the record says nothing about its rules. The data settles it — 69 of 96 cashier test
files already cite a record and 16 of 26 codex rules do, while only 4 of 64 ADRs cite a test and no
frontmatter field links one. Harvesting covers 50 of 64 cashier ADRs with no new authoring
(`DEC-013`). Driver-spec coverage is indirect by design: a rule cites a decision, and the decision
depends on the constraint.

**compact is the single compile engine; `architecture.md` is a sibling output** (`DEC-014`). Both
the hat views and architecture.md compile from the same records. Archive's compile step, the final
phase of knockdown, and the post-reconciliation rebuild in rebase and abandon all call it rather
than each synthesising its own way. Compacting an already-compacted document is the failure mode
`DEC-011` rejects, at a larger scale (`DEC-014`).

**v1 does not change what explore and apply load** (`DEC-015`). The views, manifest, `--check` and
open-loop backlog ship first; switching the read path is a later initiative, taken once the views
have been proven against real work. Switching makes the view the effective surrogate with nothing
cross-checking it — the same asymmetry `DEC-002` records: a deferred win costs time, a wrong
surrogate costs every decision made against it. When the switch comes, the rule is **use the view
to find your way, read the record before acting on it** (`DEC-015`, `DEC-009`).

**The surface is the CLI plus generated agent files** (`DEC-017`). No GUI, no CI/CD product. A tool
built to evolve quickly cannot also carry a graphical surface redesigned on every workflow change;
the agent *is* the interface, and the generated skill files are text because the consumer is a
language model. The honest cost is discoverability, accepted rather than dismissed — which is why
the documentation burden in `DS-SELF-USE-SCOPE` is a requirement, not an aspiration (`DEC-017`).

### Parallel universes and reconciliation

**A universe is a git worktree; the surrogate stays in place** (`DEC-001`). `opensprint/` lives in
its branch and travels with the code — no copying, no universe registry, no synchronisation
daemon. Git's worktree model already provides the isolation, and existing diff, log and merge
tooling applies to surrogate files directly (`DEC-001`).

**The agent reasons, the operator confirms** (`DEC-002`). Auto-accept only when purely additive or
identical; everything else escalates, including "similar but not identical". The asymmetry is
intentional: a false escalation costs one prompt, a false auto-accept risks a corrupted surrogate.
Two ADRs can differ by one sentence and represent incompatible worldviews (`DEC-002`).

**DFS traversal: initiative → ADRs → active changes** (`DEC-003`). The initiative is the unit of
commitment; if any inner node produces an unresolved conflict, the whole initiative pauses before
the traversal advances. This gives dependency coherence, atomic commitment, and operator prompts
grouped at meaningful boundaries. Citizens classify as MIGRATE, CONFLICT, REDUNDANT or SUPERSEDED
(`DEC-003`).

**A mandatory planning phase precedes execution** (`DEC-004`). Both reconciliation skills open with
a read-only pass producing a conflict manifest, and execution begins only after explicit
confirmation. There is no fast path. The phase also warns on model requirements and surfaces a
wrong-command recommendation when ADR divergence suggests abandon was meant rather than rebase
(`DEC-004`, `DEC-002`).

**The abandoned universe is archived at `opensprint/abandoned/{name}/`** (`DEC-005`): a verbatim
snapshot of the loser's surrogate captured *before* any migration, plus a migration manifest
recording every citizen, its classification, and the operator decisions. The worktree and branch
are removed only after the operator confirms the manifest. The snapshot is the recovery path if
the wrong universe was abandoned (`DEC-005`, `DEC-003`).

## Constraints

None assigned to this hat. The constraints these decisions answer live in
[product.md](product.md) and [maintainer.md](maintainer.md).

## Open Loops

**Harvested** (`DEC-013`): six of sixteen active decisions have no rule citing them.

| Decision | About |
|---|---|
| `DEC-005` | abandoned universe archive structure |
| `DEC-008` | the charter compiles from governance records |
| `DEC-010` | provenance manifest and `--check` |
| `DEC-013` | rule links harvested from code |
| `DEC-015` | v1 defers the loading switch |
| `DEC-017` | CLI plus generated files, no GUI |

`DEC-010` and `DEC-013` are worth noticing: the two decisions that build the loop-closure
machinery are themselves unguarded by it. Their implementations are tested, but no rule names
them, so the harvest cannot see the link.

`DEC-007` was on this list until a test in `backlog-seam` named it, which closed the loop with no
bookkeeping — and, transitively, closed `DS-LOOP-CLOSURE`'s in [product.md](product.md).

**Structural:**

- **No charter record.** The charter above is inferred from the decisions themselves rather than
  from a record stating this hat's boundary.
- **Sixteen decisions, no constraints.** Every driver-spec routes to `product` or `maintainer`,
  which is the intended shape (`DS-SQUAD-HATS`) but means no view is self-contained.
