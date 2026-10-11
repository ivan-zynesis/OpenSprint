---
id: surrogate-currency
status: completed
state: completed
created: 2026-10-10
completed: 2026-10-11
depends-on:
  - lifecycle-beyond-build
---

## Description

Compiled views are produced once, at archive, by whoever happens to be there. That is correct for
half of them and wrong for the other half, and nothing says which.

**Views run on two clocks.** `product` and `maintainer` move on the **record clock** — their inputs
change at propose and at attest, both bracketed by archive. `dev` and `devops` move on the **code
clock** — four of their five sections observe the filesystem, and every escalation during apply
produces another ADR that feeds them. Compiling everything at archive leaves those two stale for
the entire duration of an initiative, which is precisely the window in which agents read them to
decide how to build.

The fix is not "recompile whatever is stale". That would let an agent deep in implementation author
the product view, rendering intent through an implementation lens — **invisible drift**, where
staleness is at least reported. So the rule is about authorship:

> **A hat's view is compiled only while someone accountable for that hat is present and approving**
> ([[DS-VIEW-AUTHORSHIP]]).

During normal apply the only hat in the room is dev's, and [[DEC-028]] makes that an identity rather
than a restriction: every decision written during apply is owned by `dev` or `devops`.

The exception proves the rule. A specification that does not cover everything a developer needs is
the **normal case**; when the surrogate cannot answer a driver-spec question, apply has correctly
discovered that product or maintainer left something unsaid. So it pauses visibly, the dev hat is
set down, the question's hat is **inferred rather than asked**, and the operator answers wearing it
([[DS-ESCALATION-HANDOFF]]). At that moment the accountable author genuinely is present — so
compiling that hat's view is legitimate, on explicit approval against a stated blast radius.

Two more things follow from the same rule. `/opsp:knockdown` should produce **all five** views, with
`product` and `maintainer` empty — and seven empty maintainer objectives on day one is the most
useful thing a reverse-engineered surrogate can say. And a project whose records predate a shape
change needs **assisted backfill**, which this repository proved by hand-migrating its own records
across two milestones of `lifecycle-beyond-build`.

### The two clocks

```
   RECORD CLOCK                        CODE CLOCK
   product · maintainer                dev · devops
   ────────────────                    ────────────
   O, G      ← backlog                 package.json, lockfiles
   S, M-bar  ← propose                 migrations, schemas       change
   posture   ← attest                  Dockerfiles, IaC          continuously
   evidence  ← attest                  CI configs                through apply
   exposure  ← attest
                                       + every ADR an escalation
   compiled at archive                   produces (DEC-028)
                                       compiled at each milestone
```

### Who may compile what

| Moment | Who is present | May compile |
|---|---|---|
| `/opsp:apply`, normal work | the dev/devops agent | `dev` · `devops` |
| `/opsp:apply`, approved escalation | the operator, wearing product or maintainer | that hat only |
| `/opsp:attest` | product/maintainer, narrow context | measures — never `dev`/`devops` |
| `/opsp:archive` | the initiative is closing | everything |
| `/opsp:knockdown` | the operator, throughout | all five |

## Driver Specs

- DS-VIEW-AUTHORSHIP
- DS-ESCALATION-HANDOFF

## ADRs

- DEC-SCOPED-SEAL — seal is scopeable, and never blesses a section it did not render
- DEC-COMPILE-ON-MILESTONE — apply compiles at each milestone boundary, bounded to the hat present
- DEC-ESCALATION-IS-A-STAGE — an escalation renders as a stage boundary, not a prompt
- DEC-CLASSIFY-IN-QUESTION — the escalation carries its own classification; the hat is inferred
- DEC-COMPILE-ON-APPROVAL — an approved escalation permits compiling the affected hat's view
- DEC-KNOCKDOWN-ALL-VIEWS — knockdown produces all five; the empty ones are the finding
- DEC-MIGRATE-SEPARATE-TOOL — schema migration is its own tool, distinct from rebuild-assess

## Milestones

- [x] scoped-seal: `compact seal --hat <name>…`; sealing never blesses a section it did not just render. **Blocks everything else** — without it, compiling two hats marks four fresh, which this project already did once by accident
- [x] render-on-milestone: `/opsp:apply` compiles stale `dev` and `devops` sections at each milestone boundary, after the change branch merges
- [x] escalation-handoff: the visible pause; inferred classification carried in the question with a draft record and blast radius; explicit approval; the affected hat's view compiled on approval
- [x] knockdown-views: `/opsp:knockdown` produces all five views, empty `product` and `maintainer` rendered as a first-class finding
- [x] migrate-tool: `/opsp:migrate` — detect records the current shapes cannot select, grill the operator one record at a time, backfill on confirmation. **Validated against this repository's own stale state** (see below)

`scoped-seal` genuinely blocks the two after it. `knockdown-views` and `migrate-tool` are
independent of the rest and of each other.

## Progress

**1/5 — `scoped-seal`** · opsx change `2026-10-10-scoped-seal`

`compact seal --hat <name>` scopes sealing, and sealing now refuses to bless a hat whose view was not re-rendered — comparing the view's hash against what the manifest already records, and carrying entries forward verbatim when they match.

The second rule turned out to matter more than the flag: a caller can scope correctly and still bless a section whose inputs moved while its prose was never regenerated.

Verified against the original failure. With twelve sections stale and nothing re-rendered, an unscoped seal reports `Sealed 0 section(s)`, carries all four hats forward, and `compact check` still reports twelve stale. Before this change the same command made the gate pass. It also protects the migration fixture below without anyone having to remember.

**2/5 — `render-on-milestone`** · opsx change `2026-10-10-render-on-milestone`

`compact plan --hat` mirrors `seal --hat`, and `/opsp:apply` gained a compile step in Phase 3 — plan scoped to dev and devops, render only what is stale, seal scoped. Nothing stale means nothing rendered and nothing said.

Product and maintainer are **offered**, with the line that carries the whole decision: compiling while still holding the implementation is *worse than leaving the view stale*, because staleness is reported and that is not.

Open loops are deliberately not filtered by `--hat` — a loop belongs to the records, not to a view section.

**3/5 — `escalation-handoff`** · opsx change `2026-10-10-escalation-handoff`

The pause renders as a stage boundary — `PAUSED`, at this milestone, needing this hat — with the dev hat set down explicitly and picked back up as its own step. Classification moved into the question: the inferred hat with its reasoning, a draft record including a BDD bar, and the blast radius stated before approval is sought.

Naming the hat is the whole intervention. The operator has the diff in their head too, and *"what should the timeout be?"* answered by someone thinking about retries is a different answer from the same question considered against what the business promised.

Entirely a workflow change — the inference machinery already existed.

**4/5 — `knockdown-views`** · opsx change `2026-10-10-knockdown-views`

**The views were already being compiled.** Step 5 has delegated to `/opsp:compact` since knockdown was written — nothing said so, the summary listed only records, and the skill described itself as producing three things. The two most informative artifacts of a brownfield surrogate were generated and never mentioned.

Knockdown now explicitly refuses to assign a `role` or `objective` to an inferred driver-spec: intent is not readable from source, and a guessed role produces a product view that looks populated and is fiction — worse than empty, because it reads as decided when nothing was decided.

The summary names the seven maintainer objectives with nothing against them, framed as the starting backlog rather than as four-of-five-views-incomplete.

**5/5 — `migrate-tool`** · opsx change `2026-10-10-migrate-tool`

`findMigrations` detects four kinds as data — a role no hat accepts, a record no section can select, a bar predating the anatomy, and a hat whose every section selects nothing. The last is the only finding that is a property of the *view* rather than of a record, and it is how a shape change nobody noticed surfaces.

**It found a bug in shipped code.** `record-without-objective` has silently never fired in production since `lifecycle-beyond-build` milestone 2: `open-loops` declares `inputs: 'none'` and no roles, and treating "declares no roles" as "takes anything" made every record look reachable. Its tests passed only because the fixtures had no `open-loops` section — exactly the validated-against-your-own-fixtures risk this change's design had named. Fixed in both call sites.

## Notes

**Corrected: the stale views were never a migration fixture.**

This was recorded at proposal as a live test case for `/opsp:migrate`, and building that tool showed
it was two different things conflated. The stale sections are **ordinary staleness** — records were
*added* during these sessions, which is what archive clears. A migration case is a record the
current shapes **cannot select**, and this repository has zero: `validateRoles`,
`record-without-objective` and `record-unclassified` all agree.

The only two genuine cases — `DS-HIGH-IMPACT-OPS` and `DS-BACKWARD-COMPAT` at `role: bar` — were
hand-migrated in `lifecycle-beyond-build` milestone 2. **The fixture that motivated the tool was
consumed by the work that proved the need.**

So `/opsp:migrate` ships validated against the historical case reconstructed in tests, and nothing
else. The next real shape change is its first true validation. That is stated in the milestone's
tasks rather than left to be discovered.

**Decision ids are semantic from here.** [[DEC-036]] decided this and recorded a prerequisite — the
rule harvest matched `DEC-\d{3}` only, so a semantic id written before widening it would have been
invisible, reported `decision-unguarded` forever. That widening was pulled forward from
`sdlc-operating-contract`'s `record-naming` milestone and landed before these records were written,
stopping the numbered era at `DEC-044`. Both forms match permanently; this is not a migration
window.

## OPSX Changes

- `openspec/changes/archive/2026-10-10-scoped-seal/`
- `openspec/changes/archive/2026-10-10-render-on-milestone/`
- `openspec/changes/archive/2026-10-10-escalation-handoff/`
- `openspec/changes/archive/2026-10-10-knockdown-views/`
- `openspec/changes/archive/2026-10-10-migrate-tool/`

## Attestation

- **frame**: `opsp/sdlc-operating-contract` against `origin/main`, `2c24097..a018238`, 90 commits — confirmed by the operator; anything committed after `a018238` is outside this attestation
- **door**: two-way — the merge reverts with `git revert` and no data migration; nothing publishes on merge, because the release workflow runs only on the upstream repository. Two parts are one-way: an npm publish (a version number cannot be reused), and a downstream project that writes semantic decision ids under the new version may not read them back after a downgrade to 0.0.9
- **blast-radius**: `compact seal --hat` (scoped sealing), `/opsp:apply` compiling `dev` and `devops` at each milestone boundary and pausing on escalation, `/opsp:knockdown` producing all five views, and the new `migrate` command with `/opsp:migrate`. In adopter projects, apply now writes compiled views during implementation rather than only at archive

### RACI

| Concern | Handled by | R | A | C | I |
|---|---|---|---|---|---|
| build, test, typecheck and lint regressions | system — GitHub Actions `ci.yml` on pull requests to `main` | — | — | — | — |
| an `opsp/*` branch merging unattested, or with stale views | **not automated** — no surrogate job runs `compact check` or a state check in this repository | Ivan Lee | Ivan Lee | — | — |
| npm release, and telling adopter projects to run `opensprint update` | **not automated** — the release workflow is gated to the upstream repository | Ivan Lee | Ivan Lee | — | — |
| agent behaviour in adopter projects — escalation, attest scope and triage are tested as instruction text only | **not automated** | Ivan Lee | Ivan Lee | — | — |

## Open Questions

None blocking. Where product/maintainer staleness is surfaced between archives was open at proposal
and is now settled in [[DEC-COMPILE-ON-MILESTONE]]: apply **offers** to compile them, because the
point of the surrogate is to carry context and a stale view actively misleads whoever loads it next.
Accepting is a context switch, not a render.
