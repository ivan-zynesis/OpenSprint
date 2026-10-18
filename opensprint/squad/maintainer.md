# maintainer — what must be true of it while it does that?

The technical product manager. The same OGSM as `product`, with one difference that carries
everything: **its objectives are inherited, not discovered** (`DS-MAINTAINER-INHERITED`). Seven of
them, present in substantially every software project — which is why this accountability was split
off from product and given to a specialist.

**Nothing below is attested.** Every claim here rests on a *decision*, not on evidence that it holds
(`DS-ATTESTED-TRUTH`). `/opsp:attest` first ran on 2026-10-11 and judged no bar `met`, so each row
states what was decided — with the posture and exposure recorded against it — rather than what is
true of the running system.

## Posture

**Self-use, and what that buys.**

Tech giants and LLM providers could ship something that does this better. We do not intend to
compete: OpenSprint exists to be evolved quickly for our own use, kept well documented, and to give
stakeholders maximum visibility into a well-organised agentic SDLC (`DS-SELF-USE-SCOPE`).

This is the standard the whole hat is held to, and it sits deliberately below what a product sold to
strangers would hold. Every objective below deviates from it, or does not.

| Below bar | Accepted because | Expires when |
|---|---|---|
| the `devops` hat is empty — no infrastructure, no deploys | we orchestrate work in repositories that already have both (`DEC-017`) | this repository acquires infrastructure of its own |
| no GUI; the surface is a CLI plus generated agent files | the agent *is* the interface, and those files are text because the consumer is a language model (`DEC-017`) | — |
| discoverability is poor | accepted explicitly rather than dismissed, which is why the documentation burden is a requirement (`DS-SELF-USE-SCOPE`) | adoption by people we do not talk to (`DEC-017`) |

Competing on feature parity with a provider that owns the model would set the roadmap by someone
else's release schedule. Optimising instead for speed of evolution keeps the tool useful on the day
we need it — and that is the whole trade.

## Security & Access

**Nothing recorded.**

No goal, no strategy, no measure. For a tool that ships no service and holds no credentials this may
be proportionate — but it is unstated rather than reasoned, and the distinction matters: `DEC-017`
argues the empty `devops` hat is deliberate, and nothing makes that argument here.

## Isolation & Confidentiality

**Nothing recorded.**

Worth noting what is adjacent and unclaimed: `DS-PARALLEL-EXEC` gives each initiative its own
worktree and surrogate, which is an isolation property of the design. No record states it as a bar,
so nothing says what it guarantees or what would breach it.

## Privacy, Retention & Legal

**Nothing recorded.**

The tool collects command names and a version string (`src/telemetry/`). Nothing states what that is
for, how long it is kept, or who can see it.

## Integrity & Correctness

**Goal — nothing is documented as true until it is attested.** A compiled claim may be stated as
present-tense fact only when a human has asserted it with evidence; intent written in the grammar of
state is the defect (`DS-ATTESTED-TRUTH`). It is answered by three decisions: `attested` as a third
citation authority beside decided and observed (`DEC-021`), attestation as its own tool rather than a
phase of compact (`DEC-022`), and that tool writing a record without ever gating (`DEC-023`).

**Strategy — operations that mutate the canonical surrogate are operator-invocable only.**
Reconciliation (`/opsp:rebase`, `/opsp:abandon`) is decided as never triggerable by a pipeline, a
sub-agent or another skill, because a corrupted surrogate degrades every agent that reads it
(`DS-HIGH-IMPACT-OPS`). Compaction is released from this position: it never writes a record and
every view regenerates, so it cannot corrupt the surrogate (`DEC-006`).

```
mutating reconciliation is operator-invocable only            (DS-HIGH-IMPACT-OPS)
  → DEC-002 (dev)   the agent reasons, the operator confirms
    strength:    a false escalation costs one prompt; a false auto-accept costs the surrogate
    weakness:    unrecorded
    opportunity: unrecorded — the factors are bullets, no alternative column is weighed
    threat:      operator fatigue from a high escalation rate — mitigated by a confidence-scoring
                 rubric, with the default kept conservative
  → DEC-004 (dev)   a read-only planning phase precedes execution
    strength:    no undo short of git reset, so scope and a wrong-command guard come first
    weakness:    unrecorded
    opportunity: unrecorded — the factors are bullets, no alternative column is weighed
    threat:      planning becomes slow on very large surrogates — mitigated by a count-only pre-scan
```

**Measure — the goal.** Three measures: no compiled claim in the present tense without an attestation
behind it (**Primary**); a compiled view visibly distinguishes decided, observed and attested claims
(**Guardrail**); an attestation carries a date, so staleness is computable (**Freshness**)
(`DS-ATTESTED-TRUTH`).

```
bar:        no `### Bar` recorded
posture:    partially met — attested by Ivan Lee, 2026-10-11 (DS-ATTESTED-TRUTH)
exposure:   recorded, with no mitigated-by
```

The attestation found classification of a record as decided or attested asserted — including that an
attestation needs both a date and evidence, and that the date carries without expiring
(`test/core/compact-measures.test.ts`). It found three things unasserted: the tense of compiled claims
(**Primary**); the `observed` authority in compiled output, since the test titled "three authorities"
checks two, neither of them `attested` (**Guardrail**); and that a verdict with evidence but no
`attested-on` is downgraded (**Freshness**) (`DS-ATTESTED-TRUTH`).

Exposure as recorded: a compiled view may state present-tense claims with no attestation behind them,
and the decided / observed / attested distinction is unverified in rendered output
(`DS-ATTESTED-TRUTH`).
Observed since: `/opsp:apply`, `/opsp:explore`, `/opsp:triage` and `/opsp:propose` orient on these
views before any record, so a compiled claim is now the first thing an agent acts on. Where
`compact plan` reports a section stale they also read what moved since it was compiled, and they set
aside one it reports unsealed or tampered and read its records instead
(`src/core/templates/workflows/opsp-apply.ts` and its siblings). The exposure stands as recorded:
nothing checks the tense of a claim in a fresh view.

**Measure — the strategy.** No operation that mutates the canonical surrogate is reachable from a
pipeline, a sub-agent or another skill (`DS-HIGH-IMPACT-OPS`).

```
bar:        dimension — automation ←→ human confirmation, on surrogate-mutating operations
            chosen    — fully manual: /opsp:rebase and /opsp:abandon, operator-invocable only
            traded for— every scrap of automation on these two operations, permanently
            neighbour — unrecorded: nothing says what partial automation would look like or cost
            form      — prose; no given / when / then is recorded
posture:    no verdict — "stated as absolute rather than as a preference"
exposure:   recorded, with no mitigated-by
```

The posture states no verdict, so the measure is unattested (`DS-HIGH-IMPACT-OPS`). Its exposure: a
corrupted surrogate degrades every downstream agent operation and the damage is unbounded; a false
escalation costs one prompt, a false auto-accept costs the surrogate (`DS-HIGH-IMPACT-OPS`,
`DEC-002`). The position is therefore **decided, not attested** — nothing recorded says the guardrail
holds in the running system.

**A disagreement between records.** `DEC-019` describes `DS-HIGH-IMPACT-OPS` migrating to *"an
`integrity & correctness` goal whose strategy is 'mutating reconciliation is operator-invocable
only'"*; the record itself carries `role: strategy`, and the goal of this objective is
`DS-ATTESTED-TRUTH`. Rendered here as the record states it.

## Change & Quality

**Goal — nothing recorded.** Nine records select this objective and every one carries
`role: strategy`; none states the outcome they serve, so the goal cell is empty
(`DS-SURROGATE-GIT-CONTRACT`, `DS-ATTEST-AS-REVIEW`, `DS-CI-ATTESTATION`, `DS-MEASURE-ANATOMY`,
`DS-DOCUMENTATION-REVIEWED`, `DS-ESCALATION-HANDOFF`, `DS-VIEW-AUTHORSHIP`, `DS-STRATEGY-ALTITUDE`,
`DS-BACKWARD-COMPAT`).

**Where the measures stand.** Eight of the nine were attested by Ivan Lee on 2026-10-11. **None is
`met`**, so nothing in this section is a present-tense property of the system — every position below
is decided, and the verdicts say how far the tests bear it out.

| Strategy | Verdict |
|---|---|
| one PR per initiative, attested before it merges | **not met** (`DS-SURROGATE-GIT-CONTRACT`) |
| attestation reviews the implementation against the strategy | partially met (`DS-ATTEST-AS-REVIEW`) |
| evidence is a CI artifact | partially met (`DS-CI-ATTESTATION`) |
| every measure has the same four parts | partially met (`DS-MEASURE-ANATOMY`) |
| documentation quality is reviewed at attestation | partially met (`DS-DOCUMENTATION-REVIEWED`) |
| an escalation is a hat handoff | cannot assess (`DS-ESCALATION-HANDOFF`) |
| a view is compiled only by an accountable author | partially met (`DS-VIEW-AUTHORSHIP`) |
| a maintainer strategy stays above domain know-how | cannot assess (`DS-STRATEGY-ALTITUDE`) |
| backward compatibility is best-effort | no verdict recorded (`DS-BACKWARD-COMPAT`) |

No record here carries an `### Evidence` block; under `DEC-041` a verdict short of `met` requires an
exposure rather than evidence, and each attested record has one. **No exposure carries a
`mitigated-by`** — each stands on the board as an unplanned risk. Three record that an earlier
pointer was removed because it named the initiative under attestation
(`DS-DOCUMENTATION-REVIEWED`, `DS-ESCALATION-HANDOFF`), one adding that the initiative closes without
retiring the exposure (`DS-ATTEST-AS-REVIEW`).

### One PR per initiative, attested before it merges

Planning is authored in the initiative's own worktree; change branches merge into the initiative
branch; the single `opsp/<initiative> → main` pull request is where every other hat arrives, and
attestation happens before that merge, never after; `main` is production grade by definition
(`DS-SURROGATE-GIT-CONTRACT`).

```
 explore ── backlog ── triage ── propose ── apply ──────── attest ──────── archive
 product/   worktree   same      same       opsx/* →       opsp/* PR       opsp/* → main
 maintainer created    worktree  worktree   opsp/*         open, not
            opsp/<i>                        no product     merged
                                                                    (DS-SURROGATE-GIT-CONTRACT)
```

```
one initiative, one branch, one pull request, attested before main     (DS-SURROGATE-GIT-CONTRACT)
  → DEC-029 (dev, devops)   planning happens in the initiative's worktree
    strength:    planning is visible to the work it plans; nothing is committed straight to main
    weakness:    the backlog is scattered across branches; every initiative can collide on ids
    opportunity: planning on main
    threat:      cross-branch listing proves unsolvable — mitigated by moving the backlog alone to
                 main, splitting the decision; the signal is a stakeholder who cannot see candidates
  → DEC-BOARD-ALL-BRANCHES (dev)   the cross-branch board is printed on demand, never committed
    strength:    any checkout sees every initiative after a fetch; the committed board stays
                 deterministic and `compact check` meaningful; the one-branch initiative is kept
    weakness:    a stakeholder reading BOARD.md still sees one branch — they must run the command
    opportunity: commit a board aggregating every branch; the backlog on main
    threat:      stakeholders reading BOARD.md routinely miss other branches' work, or teams stop
                 fetching opsp/* refs and the printed board is stale by construction
  → DEC-030 (dev, devops)   rebase, attest, archive, merge — one PR, gated on state consistency
    strength:    dangling initiatives prevented by the gate; derived artifacts correct on arrival
    weakness:    the branch must be current before closing
    opportunity: a closing PR after the merge; archiving without rebasing
    threat:      a gate blocking ready work — mitigated by revisiting the state vocabulary (DEC-024)
  → DEC-023 (dev, maintainer)   the gate is on state consistency, never on whether a bar was met
    strength:    stays inside the surrogate's scope; the operator keeps the judgement
    weakness:    a missed bar is not caught automatically — a human must read
    opportunity: gating on unmet bars
    threat:      a need for real certification — a deliberate scope change, not a feature; the
                 first PR adding an exit code to attest is the signal
```

Derived artifacts that conflict across initiatives are resolved by recompiling, never by
hand-merging (`DS-SURROGATE-GIT-CONTRACT`, `DEC-006`).

```
bar:        no `### Bar` recorded; measures in prose
            Primary   — no commit reaches main for an initiative whose bars are unattested
            Guardrail — a PR merging opsp/* fails when initiative state and view freshness
                        disagree with what git shows
            Hygiene   — no pull request exists whose only content is attestation
posture:    NOT MET — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

**This strategy is not met** (`DS-SURROGATE-GIT-CONTRACT`). The attestation records that nothing
tested prevents a commit reaching `main`: `state-contradicted` fires only once a branch has merged
(`test/core/initiatives.test.ts`), `compact check` exits zero with open loops
(`test/cli-e2e/compact.test.ts`), this repository runs no surrogate job on `opsp/*` pull requests,
and `docs/git-workflow.md` recommends a state-is-attested check that no command performs. Of the
**Guardrail**, the view-freshness half is asserted — `compact check` fails on drift — while the git
half is unit-tested with injected state and wired into no check. **Hygiene** is instruction text only.
Re-reviewed against `a018238`: unchanged — `opensprint advance --to attested` succeeds on an
initiative with no `## Attestation` and no posture (`test/cli-e2e/advance.test.ts`), and an initiative
with no state may move straight to `completed` (`test/core/initiative-transitions.test.ts`). Re-reviewed
again against `634670f` on 2026-10-18: unchanged — that range adds owners and a cross-branch board,
and no test in it touches a merge gate, a pull request or CI (`DS-SURROGATE-GIT-CONTRACT`).

So the gate `DEC-030` decides is, per this attestation, not wired anywhere. Exposure as recorded: an
`opsp/*` branch can merge to `main` unattested, this one included, and the CI snippet in
`docs/git-workflow.md` installs the published package, which predates `frame`, `migrate` and the new
loop kinds (`DS-SURROGATE-GIT-CONTRACT`).

The record names its own deliberate cost: no branch can see every backlog item, which breaks the one
interaction non-technical stakeholders have — an agent reading the compiled board for them
(`DS-SURROGATE-GIT-CONTRACT`, `DS-HATS-AS-CONTEXT`, `DEC-029`). That cost is now answered by a
printed cross-branch board, read from committed work only and never written to `BOARD.md`
(`DEC-BOARD-ALL-BRANCHES`), and attested under its own goal (`DS-BOARD-VISIBILITY`). The record
itself has not been revised, and the committed board still shows one branch.

### Attestation reviews the implementation against the stated strategy

Attestation is the review of how the implementation matches the strategy proposed, and the moment a
change hands off from `dev` into security and operations. It reads the test files and never the
source, the design discussion or the decision rationales, and every attestation answers
reversibility, blast radius and RACI for whatever no system handles (`DS-ATTEST-AS-REVIEW`).

```
attestation is a review at bar altitude, and a handoff past merge          (DS-ATTEST-AS-REVIEW)
  → DEC-040 (dev)   the attester reads the tests — never source, design or rationale
                    (supersedes DEC-033)
    strength:    a test is the bar restated; a suite that asserts nothing becomes visible
    weakness:    unrecorded — no ✗ in the chosen column; the rationale accepts that some
                 self-assessment risk returns
    opportunity: CI artifacts only (DEC-033's scope); the full diff
    threat:      tests unreadable without the source, or tests generated from the bars — the scope
                 is rethought, not quietly widened
  → DEC-ATTEST-OWNING-SECTION (dev)   of the views, the attester reads only the owning
                                      hat's posture or measures section
    strength:    ADR rationale stays out; the attester knows the standard a posture deviates
                 from; one section of context
    weakness:    the read is heading-to-heading, which the instruction has to state precisely
    opportunity: no view at all; the whole view
    threat:      a posture or measures section that starts carrying rationale readmits what
                 DEC-040 excludes; attesters needing another section means the shapes are wrong
  → DEC-041 (dev)   posture is the judgement; evidence and exposure are conditional on it
    strength:    one precise loop per verdict, and an unmet bar still reports
    weakness:    three branches where two unconditional checks would do
    opportunity: requiring both evidence and exposure on every measure
    threat:      `met` postures routinely needing an exposure; mitigation unrecorded
  → DEC-042 (dev)   the three review questions live on the initiative
    strength:    a change is the unit; harvestable; no answer repeated per measure
    weakness:    unrecorded
    opportunity: per measure; a separate record type
    threat:      "handled by a system" used to avoid naming a human — mitigated by requiring a
                 named owner even for automated concerns
  → DEC-043 (dev)   the agent that wrote the tests may not attest them
    strength:    the author cannot grade their own assertion; costs a session, not a person
    weakness:    enforceable by instruction only
    opportunity: refusing only on implementation; trusting the narrow context
    threat:      operators attest in the authoring session anyway — then remove the rule and record
                 that attestation here is self-assessment
```

```
bar:        dimension — review depth ←→ attester independence
            chosen    — test files, bars and CI artifacts; never source, design or rationale
            traded for— the ability to diagnose why a bar was missed, which stays with dev
            neighbour — unrecorded: nothing says what reading the diff under a stricter protocol
                        would buy
            form      — prose; no given / when / then is recorded
posture:    partially met — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found the three review questions asserted on an attested initiative —
`test/core/classification.test.ts` fires on a missing door, blast radius and unassigned RACI rows —
but no test shows the *"or records why not"* path clearing the loop. **Scope** and **Guardrail**
(never a block) are asserted only as instruction text (`test/core/attest.test.ts`); the exit-zero
e2e covers a different loop kind (`DS-ATTEST-AS-REVIEW`).

Exposure as recorded: reading tests reintroduces some self-assessment risk, since the agent that
wrote the tests is often the one asked to attest; the **Scope** bar is unassertable by any test in the
suite, so an attester that reads source is not detected; the *"or records why not"* path is untested
(`DS-ATTEST-AS-REVIEW`).

### Evidence is a CI artifact

Evidence is something the pipeline produced; testing belongs in CI, not CD. A change to the pipeline
itself is the named exemption — attested post-merge, riding the next initiative that touches the area
rather than earning a pull request of its own. The record states this as a bet: refusing post-merge
acceptance forces the investment in CI (`DS-CI-ATTESTATION`).

```
evidence is what the pipeline produced                                     (DS-CI-ATTESTATION)
  → DEC-032 (dev, devops)   evidence is a CI artifact reference; the exemption rides the next
                            initiative
    strength:    checkable; usable by a non-engineer; the exemption has no mechanism to widen
    weakness:    pending bars close only opportunistically, and may linger
    opportunity: free prose; a dedicated follow-up PR for pipeline changes
    threat:      pending attestations outlive several initiatives — mitigated by an owner and a
                 date; ordinary work reclassed as pipeline work — mitigated by a narrower exemption
  → DEC-038 (dev)   a bar is written in BDD form, split by hat
    strength:    given / when / then maps to a test; each hat writes in its own idiom
    weakness:    two forms to learn
    opportunity: one form for both hats; free prose
    threat:      BDD bars still unattestable from CI — the problem is then the pipeline, not the form
  → DEC-033 (dev, superseded) → DEC-040 (dev)   the attester's reading scope
                                                 (rendered under the previous strategy)
```

```
bar:        no `### Bar` recorded; measures in prose
            Primary   — every `### Evidence` block references a pipeline artifact, resolvable from
                        the pull request
            Guardrail — an evidence reference that does not resolve is harvested, not assumed good
            Honesty   — `cannot assess` is a recorded outcome with an exposure, never a silent pass
posture:    partially met — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found **Honesty** asserted: `cannot assess` without an exposure is harvested
(`test/core/classification.test.ts`). **Guardrail** is partial: a local path missing from the tree is
reported, but two tests assert unresolved references are *not* — a path escaping the project root
(`test/cli-e2e/compact.test.ts`) and remote links (`test/core/classification.test.ts`, by design).
**Primary**: tests check that a reference is addressable, not that a pipeline produced it — a
comment-only file satisfies it (`DS-CI-ATTESTATION`).

Exposure as recorded: evidence citing a `../` path is silently accepted, and any file in the tree
counts as evidence regardless of whether a pipeline produced it (`DS-CI-ATTESTATION`).

**A disagreement between records.** `DEC-032` attests a pipeline-exempt bar as `posture: pending`.
`DEC-041`'s verdict table, and the harvest that reported this plan's loops, accept only `met`,
`partially met`, `not met` and `cannot assess` — so a bar attested as `DEC-032` decides would be
reported as unattested. Surfaced, not resolved.

### Every measure has the same four parts

A measure is bar, posture, evidence and exposure, for every hat: the bar written ex ante at propose,
the other three ex post at attest. Posture is not a weaker bar — it is the honest statement where no
bar was set. A half-written measure says where in the lifecycle something is (`DS-MEASURE-ANATOMY`).

```
bar · posture · evidence · exposure, inherited rather than invented        (DS-MEASURE-ANATOMY)
  → DEC-019 (dev)   the anatomy renders as optional sub-blocks under `## Measures`
    strength:    purely additive — old records parse; each part lives with its measure
    weakness:    a measure is not a first-class node
    opportunity: separate records with `role: bar`; frontmatter fields
    threat:      a bar routinely shared by several goals — it then becomes a record of its own
  → DEC-022 (dev)   attestation is a separate tool, not a phase of compact
    strength:    compact stays re-runnable without a model, and still never writes a record
    weakness:    one more skill
    opportunity: attestation as a phase of compact
    threat:      attestation turns out fully derivable from rule outcomes and test artifacts — it
                 then belongs back inside compact
```

```
bar:        no `### Bar` recorded; measures in prose
            Primary   — no compiled measure cell states a bar without stating whether it was met
            Guardrail — `measure-unasserted` and `measure-unexposed` are harvested, not noticed
posture:    partially met — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found **Guardrail** asserted with positive and negative cases
(`test/core/classification.test.ts`); **Primary** concerns compiled cells, and no test inspects a
compiled measure cell — the guarantee holds at record level only. Exposure as recorded: a compiled
view could state a bar with no posture and no test would fail; only the record-level harvest would
notice (`DS-MEASURE-ANATOMY`).

**A disagreement between records.** `DS-MEASURE-ANATOMY` still states that *"nothing in the tool
writes the second half"*. `DEC-022` decided the tool that writes it, and the postures in this section
were written by it on 2026-10-11. The statement describes the world before `DEC-022`.

### Documentation quality is reviewed at attestation

Attestation reviews whether the documentation is adequate and complete for what shipped — not who
wrote it — and urges a condensed account for external stakeholders into the documentation directory,
`docs/` by default, separate from the operating surrogate (`DS-DOCUMENTATION-REVIEWED`).

```
attestation judges documentation against what shipped              (DS-DOCUMENTATION-REVIEWED)
  → DEC-044 (dev)   attest gains a second write target — the documentation directory
    strength:    a record's claim stays stable; the external account actually gets written
    weakness:    the write surface grows by a whole directory
    opportunity: widening the record bound; never writing docs
    threat:      other tooling starts parsing or citing the directory — it then needs a record's
                 protections; the first structured read of docsDir is the signal
```

```
bar:        no `### Bar` recorded; measures in prose
            Primary   — every attested initiative records a judgement on documentation adequacy
            Location  — external documentation is written to the configured directory, docs/ default
            Guardrail — inadequate documentation is an open loop, never a block
posture:    partially met — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found **Location** asserted — the directory resolves to `docs/` by default and
follows a project override (`test/core/attest.test.ts`). **Primary** and **Guardrail** rest on
instruction text alone: no harvest reads a documentation judgement, and the loop-kind list in
`test/core/compact-loops.test.ts` has no documentation kind. Re-reviewed against `a018238`:
unchanged — `test/core/docs-drift.test.ts` guards this repository's own `docs/`, not any of the three
bars (`DS-DOCUMENTATION-REVIEWED`).

Exposure as recorded: the documentation directory is prose that nothing compiles or checks, so an
account that drifts from what shipped fails no build; and an attested initiative with no
documentation judgement is invisible to every compile (`DS-DOCUMENTATION-REVIEWED`, `DEC-044`).

### An escalation is a hat handoff, not an interruption

A specification that does not cover everything is the normal case. When the surrogate cannot answer a
question in driver-spec scope, apply pauses visibly, infers the question's hat rather than asking it,
presents a draft record, and seeks explicit approval with the blast radius stated
(`DS-ESCALATION-HANDOFF`).

```
   apply [dev] ── surrogate cannot answer ──▶ PAUSE: dev hat set down, hat inferred
                                                  │
   apply [dev] ◀── resume ── APPROVAL: record + blast radius ◀── operator [product|maintainer]
                                                                     (DS-ESCALATION-HANDOFF)
```

```
a gap in the spec is a handoff between accountabilities               (DS-ESCALATION-HANDOFF)
  → DEC-ESCALATION-IS-A-STAGE (dev)   the escalation renders as a stage boundary
    strength:    the operator knows which hat they wear; the spec gap stays visible
    weakness:    more ceremony, less flow
    opportunity: a prompt mid-flow
    threat:      escalations frequent enough that the ceremony is skipped — the fix is upstream, at
                 propose, where bars are too thin to build against
  → DEC-CLASSIFY-IN-QUESTION (dev)   the escalation carries its own classification
    strength:    the answer lands in a slot; one question, not two; the inference is correctable
    weakness:    the inference can be wrong
    opportunity: classifying after the answer; asking which hat
    threat:      frequent corrections — mitigated by offering two candidates; unread approvals —
                 mitigated by leading with the blast radius
  → DEC-COMPILE-ON-APPROVAL (dev)   an approved escalation permits compiling the affected hat
    strength:    an accountable author is present by definition; the view matches the record
    weakness:    one more approval in the flow
    opportunity: leaving the view stale until archive; compiling whenever stale
    threat:      approvals given without reading the blast radius; mitigation unrecorded
```

```
bar:        no `### Bar` recorded; measures in prose
            Primary    — every escalation presents an inferred hat and a draft record
            Visibility — the pause is rendered as a stage boundary rather than as a prompt
            Consent    — no product or maintainer record changes during apply without approval
            Honesty    — the blast radius is stated before approval is sought
posture:    cannot assess — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found hat inference by ancestry unit-tested (`test/core/hats.test.ts`) and everything
else instruction text (`test/core/opsp-apply-escalation.test.ts`): the blast-radius phrase is not
checked to precede the approval prompt, and no test runs apply and checks that a record is unchanged
on a decline. Re-reviewed against `a018238`: unchanged — the escalation-ladder tests are instruction
text, and their *"does not guess which rung"* leans towards an open question rather than an inferred
draft (`test/core/escalation-ladder.test.ts`) (`DS-ESCALATION-HANDOFF`).

Exposure as recorded: inference can be wrong, and an operator approving quickly may accept a
misclassified record that routes a constraint to the wrong view and reviewer; the evidence could not
answer whether an escalation behaves as instructed (`DS-ESCALATION-HANDOFF`).

### A hat's view is compiled only by an accountable author who is present

Views run on two clocks: product and maintainer move on the record clock (backlog, propose, attest),
dev and devops on the code clock (continuously, through apply). Each view is compiled only while
someone holding its hat is present and approving — dev/devops during apply, product/maintainer on an
approved escalation, measures at attest, everything at archive (`DS-VIEW-AUTHORSHIP`).

```
an author who holds the hat, or no compile                              (DS-VIEW-AUTHORSHIP)
  → DEC-SCOPED-SEAL (dev)   seal is scopeable, and never blesses a section it did not render
    strength:    cannot mark stale content fresh, so `check` stays trustworthy
    weakness:    one more flag
    opportunity: sealing everything, always; never sealing mid-initiative
    threat:      unscoped seal run to silence `check` — mitigated by making every seal
                 output-compared
  → DEC-COMPILE-ON-MILESTONE (dev, devops)   apply compiles at each milestone, bounded to the hat
    strength:    dev/devops at most one milestone behind; the author is already present
    weakness:    unrecorded
    opportunity: archive only; on demand; in CI
    threat:      offers to compile product/maintainer accepted without a real context switch — the
                 fallback is to report without offering
  → DEC-COMPILE-ON-APPROVAL (dev)   rendered under the previous strategy
  → DEC-KNOCKDOWN-ALL-VIEWS (dev)   knockdown produces all five views; the empty ones are the finding
    strength:    the gap is visible on day one; a complete surrogate
    weakness:    two mostly-empty views to render
    opportunity: dev and devops only; no views
    threat:      empty views read as "no requirements" — the rendering is then at fault
```

```
bar:        dimension — view currency ←→ authorship discipline
            chosen    — compile continuously, but only what the hat in the room owns
            traded for— product and maintainer lag by up to one initiative, visibly
            neighbour — unrecorded: nothing says what recompiling everything on every change would
                        cost in render time or in drift
            form      — prose; no given / when / then is recorded
posture:    partially met — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found **Guardrail** asserted with a gap: an out-of-scope hat is not blessed, with a
regression test (`test/cli-e2e/compact.test.ts`), but *"just rendered"* is approximated as *"the
output bytes changed"*, so a hand edit is sealed. **Primary**: the seal manifest records no authoring
hat, so authorship cannot be checked after the fact. **Currency**: only the presence of a compile
step in the apply instructions is asserted; no test measures lag (`DS-VIEW-AUTHORSHIP`).

Exposure as recorded: a hand-edited view can be sealed as if rendered, and which hat compiled a view
is recorded nowhere it could be audited (`DS-VIEW-AUTHORSHIP`).

### A maintainer strategy stays above domain know-how

A maintainer strategy states a position, never a mechanism, and cites the `dev`/`devops` decisions
that implement it; the audience is senior management, and a cell they cannot read is in the wrong
place (`DS-STRATEGY-ALTITUDE`).

```
the maintainer view is an index into dev and devops                    (DS-STRATEGY-ALTITUDE)
  → DEC-020 (dev, maintainer)   the existing citation rule enforces the altitude
    strength:    no new mechanism; an uncitable claim cannot be written; graph, not regex
    weakness:    still partly depends on compact's synthetic half behaving
    opportunity: a length or vocabulary rule; an unenforced convention
    threat:      strategies with no implementer because the mechanism is genuinely absent —
                 `strategy-unimplemented` then belongs on the roadmap, not in open loops
```

```
bar:        no `### Bar` recorded; measures in prose
            Primary     — every maintainer strategy cell cites a dev/devops decision or is reported
                          as `strategy-unimplemented`
            Readability — a strategy cell is intelligible to a reader who has opened no record
posture:    cannot assess — attested by Ivan Lee, 2026-10-11
exposure:   recorded, with no mitigated-by
```

The attestation found that no test fires or clears `strategy-unimplemented` — it appears only in the
loop-kind list in `test/core/compact-loops.test.ts` — and that **Readability** is not unit-testable,
the SWOT rendering being asserted as instruction text only. The loop did fire on this repository's
own records during attestation, a local observation rather than a pipeline artifact. Exposure as
recorded: a regression in `strategy-unimplemented` would pass the suite (`DS-STRATEGY-ALTITUDE`).

### Backward compatibility is best-effort

A new tooling release attempts to work with a project already running an earlier version of
OpenSprint — best-effort, not guaranteed. A published package is static, so the only surface that can
break is a new release meeting an older project's `openspec/` and `opensprint/` directories
(`DS-BACKWARD-COMPAT`). The record follows from `DS-SELF-USE-SCOPE`: a tool optimised for speed of
evolution cannot also promise never to move.

```
best-effort, scoped to a new release meeting an older project              (DS-BACKWARD-COMPAT)
  → no decision is named in the record's implications; descending by depends-on:
  → DEC-MIGRATE-SEPARATE-TOOL (dev)   schema migration is its own tool
    strength:    upgrades are assisted; reuses detection that half-exists; clear when to run it
    weakness:    one more tool on the surface
    opportunity: folding it into /opsp:rebuild-assess; leaving migration manual
    threat:      migration routinely requires re-deciding — the boundary is then wrong and the two
                 tools merge; if shapes stop changing, the tool is removed
  → DEC-019 (dev)   additive sub-blocks — rendered under "every measure has the same four parts"
```

```
bar:        dimension — guaranteed compatibility ←→ speed of evolution
            chosen    — best-effort, scoped to one surface: a new release meeting an older project
            traded for— the ability to move quickly, which DS-SELF-USE-SCOPE says is the point
            neighbour — unrecorded: nothing says what a guarantee would cost, or over what window
            form      — prose; no given / when / then is recorded
posture:    no verdict — "below what a product sold to strangers would hold, and deliberately so"
```

The posture states no verdict and the record carries no exposure, so this measure is unattested
(`DS-BACKWARD-COMPAT`).

**A disagreement between records.** `DS-BACKWARD-COMPAT` still calls itself *"the one constraint on
this project that belongs to the `maintainer` hat"*; eleven records now select this view's
Integrity & Correctness and Change & Quality objectives alone.

## Availability & Continuity

**Nothing recorded.**

Added to the objective list on review, after being declined twice — the check being that a system
can be correct, secure, isolated, compliant, well-tested and cheap, and still be down. For a CLI
with no runtime there may be nothing to say; nothing says that either.

## Cost & Budget

**Nothing recorded.**

What this costs to run and maintain. The business model belongs to `product`.

## Open Loops

19 loops the harvest reports for this hat, grouped by kind. Each is reported by `opensprint compact plan`, not inferred here; the record cited is where it closes.

### `constraint-unasserted` — answered, but no rule cites any answering decision

- `DS-SELF-USE-SCOPE` — Answered by `DEC-017`, but no rule cites any of them.
- `DS-STRATEGY-ALTITUDE` — Answered by `DEC-020`, but no rule cites any of them.

### `decision-unguarded` — a decision no rule cites

- `DEC-020`

_No rule cites this decision._

### `measure-unattested` — a measure nobody has judged, or judged with an unrecognised verdict

- `DS-BACKWARD-COMPAT`
- `DS-HIGH-IMPACT-OPS`

_States a posture with an unrecognised verdict. Accepted: met, partially met, not met, cannot assess._

### `exposure-unmitigated` — an exposure with no `mitigated-by`

- `DS-ATTEST-AS-REVIEW`
- `DS-ATTESTED-TRUTH`
- `DS-CI-ATTESTATION`
- `DS-DOCUMENTATION-REVIEWED`
- `DS-ESCALATION-HANDOFF`
- `DS-HIGH-IMPACT-OPS`
- `DS-MEASURE-ANATOMY`
- `DS-STRATEGY-ALTITUDE`
- `DS-SURROGATE-GIT-CONTRACT`
- `DS-VIEW-AUTHORSHIP`

_States an exposure with no `mitigated-by`. A risk with no planned work is a confession._

### `bar-without-form` — a bar stated in prose rather than in its hat's form

- `DS-ATTEST-AS-REVIEW`
- `DS-BACKWARD-COMPAT`
- `DS-HIGH-IMPACT-OPS`
- `DS-VIEW-AUTHORSHIP`

_States a bar in prose. A maintainer bar is written `given / when / then`, which is already a test specification._
