---
id: DS-SURROGATE-GIT-CONTRACT
type: architecture
status: active
created: 2026-10-09
hats: [product, maintainer]
role: strategy
objective: change-quality
depends-on:
  - DS-PARALLEL-EXEC
---

# DS-SURROGATE-GIT-CONTRACT: One PR Per Initiative, Attested Before It Merges

## Statement

The surrogate binds to git on four rules:

1. **Planning is authored in the initiative's own worktree.** `/opsp:backlog`, `/opsp:triage` and `/opsp:propose` create or switch to it themselves. An initiative lives in one branch from its first persisted thought to its merge.
2. **One PR per initiative.** Change branches merge into the initiative branch — engineering-internal, no product involvement. The single `opsp/<initiative> → main` pull request is where every other hat arrives.
3. **Attestation happens before that merge**, never after. A second PR carrying only attestation contaminates the commit history for no gain.
4. **`main` is production grade, by definition.** When code lands there, archive and compact have already run.

The ownership boundary the branch topology already carried, now stated:

```
 STAGE     OWNS IT                      GIT                     PRODUCES
 ---------------------------------------------------------------------------
 explore   product / maintainer         none                    nothing
 backlog   product / maintainer         WORKTREE CREATED        initiative, O + G
                                        opsp/<initiative>
 triage    lead · architect ·           same worktree           advance / decline
           scrum master
 propose   same                         same worktree           + DS · ADRs · S + M
 apply     dev / devops                 opsx/* -> opsp/*        code · ADRs
                                        sub-PRs, no product
 attest    product / maintainer         opsp/* PR OPEN          posture · evidence
                                        not merged              · exposure
 archive   all                          opsp/* --> main         compiled views
```

## Rationale

The initiative branch is the product/maintainer boundary and the change branches are the dev/devops boundary. That was true of the worktree model before anyone said it, which is a good sign it is the real shape rather than an imposed one.

Attestation before merge follows from rule 4 and from [[DS-ATTESTED-TRUTH]]. If `main` is production grade, nothing may arrive there whose bar is unassessed — and if documentation cannot precede attestation, then archive cannot either. Both land in the same pull request, in order.

Planning belongs in the initiative's worktree because the alternative failed on contact. Authoring on `main` leaves planning either uncommitted — where the worktree meant to implement it cannot see it — or committed directly to `main`, bypassing review. Making the planning tools create the worktree removes the failure rather than relocating it, and gives an initiative one branch from first thought to merge ([[DEC-029]]).

The deliberate cost is that **no branch can see every backlog item**. That is a genuine unsolved problem, not a deferral: it breaks the one interaction non-technical stakeholders have, an agent reading the compiled board on their behalf ([[DS-HATS-AS-CONTEXT]]). It also widens record-id collisions back across every initiative, which is what [[DEC-036]] makes impossible by construction.

## Measures

- **Primary**: no commit reaches `main` for an initiative whose bars are unattested
- **Guardrail**: a pull request merging `opsp/*` fails when initiative state and view freshness disagree with what git shows
- **Hygiene**: no pull request exists whose only content is attestation

### Posture

- **verdict**: not met
- **attested-by**: Ivan Lee
- **attested-on**: 2026-10-11

**Primary**: nothing tested prevents a commit reaching `main`. `state-contradicted` fires only once
a branch has merged (`test/core/initiatives.test.ts`), and `compact check` exits zero with open loops
(`test/cli-e2e/compact.test.ts`). This repository runs no surrogate job on `opsp/*` pull requests,
and `docs/git-workflow.md` recommends a state-is-attested check that no command performs.
**Guardrail**: the view-freshness half is real — `compact check` fails on drift — but the git half is
unit-tested with injected state and wired into no check. **Hygiene** is instruction text only.

Re-reviewed against `a018238`: unchanged. The state machine adds a transition rule, not a merge gate — no new test touches git, a pull request or CI. `opensprint advance --to attested` succeeds on an initiative with no `## Attestation` and no posture (`test/cli-e2e/advance.test.ts`), and an initiative with no state may move straight to `completed` (`test/core/initiative-transitions.test.ts`), so the state the documentation recommends gating on can be reached without attesting.

Re-reviewed against `634670f` on 2026-10-18, by Claude Opus 5.5 for Ivan Lee: unchanged. The range
adds owners and a cross-branch board; no test in it touches a merge gate, a pull request or CI.

### Exposure

An `opsp/*` branch can merge to `main` unattested, this one included. The CI snippet in
`docs/git-workflow.md` installs the published package, which predates `frame`, `migrate` and the new
loop kinds.

## Implications

- Planning in the initiative worktree, created by the planning tools: [[DEC-029]]
- Rebase, attest, archive, merge — in that order, as one PR: [[DEC-030]]
- The gate is on state consistency, never on whether the bar was met: [[DEC-023]]
- Derived artifacts conflict across concurrent initiatives and are resolved by recompiling, never by hand-merging ([[DEC-006]])
