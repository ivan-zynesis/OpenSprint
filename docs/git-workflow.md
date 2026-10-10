# Git workflow

**We cannot control your branching model or your CI/CD, and we are not going to try.** OpenSprint
writes markdown into your repository and creates worktrees; everything else is yours.

What follows is what we recommend, and — more usefully — **why**, so you can tell which parts
matter and which are just how we happen to do it.

---

## What OpenSprint actually requires

Short list. Everything else on this page is advice.

1. **`opensprint/` and `openspec/` are committed.** They are the record. A surrogate in `.gitignore`
   is not a surrogate.
2. **Compiled artifacts are never hand-edited.** `squad/*.md`, `architecture.md`, `DECISION-MAP.md`,
   `BOARD.md`. If one is wrong, change a record and recompile.
3. **A conflict in a compiled artifact is resolved by recompiling**, never by hand-merging. A
   hand-merged view is content no compile would ever produce.

That is the whole contract. The rest is a recommendation.

---

## The shape we recommend

```
main
 │
 └─● opsp/<initiative>                    initiative branch + worktree
     ├─● opsx/<initiative>/<change-1>     change worktree, merged back, then pruned
     ├─● opsx/<initiative>/<change-2>
     └─● opsx/<initiative>/<change-3>
     │
     └────────────────────────────────▶ main      ← one PR per initiative
```

**One pull request per initiative.** Change branches merge into the initiative branch — those are
engineering-internal and need no product involvement. The single `opsp/<initiative> → main` pull
request is where every other hat arrives.

The planning workflows create the worktree themselves. `/opsp:backlog` on a fresh idea creates
`opsp/<initiative>` and writes there; `/opsp:propose` on an existing backlog item switches to the
branch already holding it. You never have to know which worktree you should be in.

### Why planning lives on the branch too

We tried it the other way — planning on `main`, worktree created at `/opsp:apply` — and it failed
within the hour. `/opsp:apply` built a worktree from `main`'s last commit while the initiative's own
planning records sat **uncommitted** on `main`, so the branch meant to implement them could not see
them. The only ways out were committing planning straight to `main`, bypassing review, or carrying
uncommitted work between worktrees by hand.

**The cost is real and we have not solved it.** With every initiative on its own branch from birth,
backlog items included, no single branch can see them all. `BOARD.md` shows the current branch's
view. For now: the forge's branch list, and `git worktree list`.

---

## Closing an initiative

```
  opsp/<initiative>  ──rebase──●──attest──●──archive──●──▶ main
```

The order is forced, and the reason is specific.

**Rebase onto `main` first.** `archive` compiles `architecture.md` and the hat views from whatever
records it can see. Compile before rebasing and you compile against a record set that does not
include whatever else landed on `main` meanwhile — the artifact is wrong the instant it merges, and
`compact check` would be right to fail it.

**Attest before merging, not after.** A second pull request carrying only attestation adds noise to
the history for no gain, and in practice the second PR is the one that never happens. Attestation
rides the PR that ships the work.

**Then archive, then merge.** Nothing can be documented that has not been attested, and archive is
what compiles the documentation.

### Gate the PR on state consistency

We recommend a required check on any `opsp/* → main` pull request:

```bash
opensprint compact check    # views agree with their records
```

…plus a check that the initiative's state is `attested`.

**This is a gate on whether you answered, never on what you answered.** A bar recorded as *not met*,
with an exposure and a plan, passes. That distinction is the whole boundary: insisting a question be
answered is a consistency check; grading the answer is certification, and certification pulls change
management and release management in behind it.

### Derived artifacts serialize initiative merges

Two initiatives both rebased and archived: the first merges fine, the second now conflicts in
`architecture.md`, `squad/*.md` and `BOARD.md`. Rebase again and recompile. It is mechanical and
cheap, and it is the only correct resolution.

Worth telling git to stop offering a text merge it must never accept:

```gitattributes
opensprint/squad/*.md       merge=binary
opensprint/architecture.md  merge=binary
opensprint/DECISION-MAP.md  merge=binary
opensprint/BOARD.md         merge=binary
```

A conflict then shows as "both modified" with no mangled text to be tempted by.

---

## CI, and the bet we are asking you to make

This is the part where our recommendation costs you something, so we will be direct about it.

**Evidence is a CI artifact.** A coverage report, a recorded end-to-end run, a `terraform plan`, a
cost diff, a scan result — something the pipeline produced, addressable from the pull request. Prose
describing a belief is not evidence.

That means **testing belongs in CI, not CD**. Normal work, infrastructure-as-code included, is
attested against what continuous integration produced *before* the merge.

### Why not attest after merge, on staging?

Because that is how most teams do acceptance, and it is why most acceptance is theatre. A product
owner clicking around a staging environment is not evidence, and nothing recorded from it survives.

Refusing that forces the investment: if a bar can only be attested from CI output, then CI must
produce output worth attesting. **The tool creates the incentive rather than accommodating its
absence.**

### If you do not have that yet

You will find attestation empty at first. The honest response is to record the emptiness, not to
route around it:

```markdown
### Posture
- **verdict**: cannot assess — no integration coverage for this path

### Exposure
We cannot tell whether the bar holds under concurrent load.
mitigated-by: ci-load-harness
```

That is a complete attestation. It does not block anything, and it produces exactly the backlog item
that makes the next attestation possible. **The system emits its own instructions for becoming
attestable.**

### The one exemption

A change to the pipeline itself cannot be tested without running it. Those bars are attested
post-merge, and the attestation **rides the next initiative that touches the area** rather than
earning a pull request of its own.

Naming the exception with a reason is different from a loophole. There is deliberately no mechanism
for it — nothing to reach for — so the only way to close a pending bar is to do work in that area,
which is when the evidence exists anyway.

### A minimal pipeline

```yaml
# .github/workflows/opensprint.yml
name: opensprint
on: [pull_request]

jobs:
  surrogate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install -g @ivan-lee/opensprint

      # The gate: compiled views must agree with their records.
      - run: opensprint compact check

      # Not a gate. Visible in the log, so gaps are seen rather than discovered.
      - run: opensprint compact loops
        continue-on-error: true
```

`compact loops` is deliberately not a gate. Open loops are a backlog, and deciding which gap is
worth work is a judgement call — a build that fails on an unmet target teaches people to stop
recording targets.

---

## Adapting this

**Trunk-based, short-lived branches?** Keep the one-PR-per-initiative shape and make initiatives
smaller. An initiative is an epic; if yours cannot merge within a few days, it is two initiatives.

**Release branches or trains?** Nothing here conflicts. `main` being production-grade is our
recommendation, not a requirement — substitute whichever branch carries that meaning for you, and
gate the PR into *it*.

**Gitflow?** `opsp/*` plays the role of a feature branch and merges into `develop`. The ordering
inside it — rebase, attest, archive — is unchanged, because it is about compiling against the right
record set rather than about which branch is downstream.

**Monorepo?** One `opensprint/` at the root. The hats already partition by accountability rather
than by package, and a surrogate per package would fragment the decision tree, which is the thing
that makes blast radius computable.

**Squash merges?** Fine. The initiative branch's history is preserved in the change branch refs,
which are kept after merge precisely so the detail survives a squash.

---

## What we will not recommend

**Automating reconciliation.** `/opsp:rebase` and `/opsp:abandon` are operator-invocable only — never
from a pipeline. A corrupted surrogate degrades every downstream agent operation and the damage is
unbounded. A false escalation costs one prompt; a false auto-accept costs the surrogate.

**Gating on open loops.** See above.

**Gating on whether a bar was met.** The tool may insist you answer. It must never grade the answer.
