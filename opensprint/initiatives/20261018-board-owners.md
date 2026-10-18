---
id: board-owners
status: completed
state: completed
owner: Ivan Lee
created: 2026-10-18
completed: 2026-10-18
---

## Description

Initiatives had no owner, and the board only showed the current checkout. Every backlog item lives
on its own `opsp/<id>` branch ([[DEC-029]]), so `/opsp:triage` could not see items filed by anyone
else, and nothing said who held a card once work began. [[DS-SURROGATE-GIT-CONTRACT]] and
[[DEC-029]] both recorded the first as a deliberate, unsolved cost.

This initiative gives an initiative an optional `owner:`, written by `opensprint claim` and shown in
an Owner column on the board, with any card in flight and unowned reported as `owner-undeclared`.
`opensprint compact board --all-branches` prints the card every local and remote-tracking `opsp/*`
branch carries, and writes nothing — the committed `BOARD.md` stays deterministic. Backlog, triage
and apply claim and release cards at the moments of commitment.

**Backfilled.** The work was built first, in AidenCaoJNG's PR (commit `e9f43f9`, rebased from
`89a607a` onto `main`; branch `feat/opsp-board-owners`), and recorded here afterwards so it can be
attested and archived with the PR. `/opsp:apply` was skipped — there was nothing left to build — so
there is no opsx change and no initiative worktree; this descriptor lives on the PR branch and merges
with it.

## Driver Specs

- DS-BOARD-VISIBILITY
- DS-SURROGATE-GIT-CONTRACT
- DS-HATS-AS-CONTEXT

## ADRs

- DEC-INITIATIVE-OWNER — an initiative names its owner, and the workflows claim it on pick-up
- DEC-BOARD-ALL-BRANCHES — the cross-branch board is printed on demand, never committed

## Milestones

- [x] board-owners: initiative owners and `opensprint claim`, the Owner column and `owner-undeclared`, the cross-branch board, and claiming wired into backlog, triage and apply — built in `e9f43f9`, asserted by `test/core/board-branches.test.ts`, `test/core/opsp-board-owners.test.ts`, `test/cli-e2e/claim.test.ts` and `test/core/board.test.ts`

## Attestation

- **frame**: `feat/opsp-board-owners` against `origin/main`, `492492b..634670f`, 3 commits, plus the uncommitted working tree (this backfill) that lands in the same pull request — confirmed by the operator
- **attester**: this attestation was made by the session that removed two citations from the templates and wrote the `DS-BOARD-VISIBILITY` bar, on the operator's explicit override of DEC-043
- **door**: two-way — reverting the pull request restores the previous board and skills; `owner:` is optional, and an initiative without it behaves as before
- **blast-radius**: `BOARD.md` gains an Owner column in every adopter project on its next compile; the new `opensprint claim` and `compact board --all-branches`; every frontmatter write, now through `writeFrontmatterField()`; and the generated skills — triage fetches, claims, commits and offers to push, apply claims before building, backlog commits its item, and propose, reexplore and review look initiatives up across branches

### RACI

| Concern | Handled by | R | A | C | I |
|---|---|---|---|---|---|
| build, test, typecheck and lint regressions | system — GitHub Actions `ci.yml` on pull requests to `main` | — | — | — | — |
| agent behaviour in adopter projects — claiming, committing and pushing are tested as instruction text only | **not automated** | Cao Minh Nhat | Ivan Lee | Cao Minh Nhat | — |
| two people claiming one card on different branches before either pushes | **not automated** — nothing reconciles a claim until it is pushed and fetched | Cao Minh Nhat | Ivan Lee | Cao Minh Nhat | — |
| a stale view going unchecked — no CI job runs `compact check` in this repository | **not automated** | Cao Minh Nhat | Ivan Lee | Cao Minh Nhat | — |
| npm release, and telling adopter projects to run `opensprint update` | **not automated** — the release workflow is gated to the upstream repository | Ivan Lee | Ivan Lee | — | — |

### Documentation

The change documents itself: `docs/concepts.md` explains owners and `owner-undeclared`,
`docs/git-workflow.md` replaces "the cost is real and we have not solved it" with how
`--all-branches` closes the gap and what it cannot see, and `docs/workflows.md` lists the two new
commands. **Finding, left as is by the operator:** the tree listings in `docs/concepts.md` and
`docs/installation.md` still describe `BOARD.md` as every initiative by state, where it now holds
only the checkout's.

## OPSX Changes

None — the work was built before this initiative was recorded, in commit `e9f43f9`; `/opsp:apply` was skipped.

## Operator Notes — beyond a compiled board

Recorded at archive by Ivan Lee; nothing here is decided. Even with `--all-branches`, the board is an
instantaneous state compiled from whatever this machine knows, and the tool is gaining tracker
capability while the backlog stays scattered across worktrees, branches and remote pull requests.
Moving it to `main` or a dedicated branch would depend on each adopter's discipline, which
OpenSprint cannot enforce. The direction is a central store read and written only through
`opensprint`, a static record for completed initiatives, and a skill that renders the live board in a
browser. Backlogged as `kanban`, with an early proof of concept on branch `opsp/kanban`.

## Notes

`DS-BOARD-VISIBILITY` and its bar were written at this backfill, not ex ante: the constraint was
already recorded as an unsolved cost in `DS-SURROGATE-GIT-CONTRACT` and `DEC-029`, and the bar states
what the PR's tests assert, at the operator's direction. `DS-SURROGATE-GIT-CONTRACT` and
`DS-HATS-AS-CONTEXT` carry bars attested on 2026-10-11 that measure other things — merge gating, the
attest context and the backlog entry point — and are claimed because this change bears on their
stated costs, not because it targets their measures.
