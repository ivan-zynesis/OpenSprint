---
id: DS-BOARD-VISIBILITY
type: product
status: active
created: 2026-10-18
hats: [product]
role: goal
depends-on:
  - DS-SURROGATE-GIT-CONTRACT
  - DS-HATS-AS-CONTEXT
---

# DS-BOARD-VISIBILITY: Every Initiative Is Visible From Any Checkout, and Work in Flight Names Its Owner

## Statement

Any checkout must be able to see every initiative, on whichever branch it lives, and every card in
flight must name the person who holds it.

## Rationale

[[DS-SURROGATE-GIT-CONTRACT]] puts each initiative on its own branch from its first persisted
thought, and records the cost as deliberate and unsolved: **no branch can see every backlog item**.
[[DEC-029]] says the same, and names the first sign that the cost has become intolerable — a
stakeholder unable to see candidate work without being walked through the forge.

[[DS-HATS-AS-CONTEXT]] makes reading the board the one thing a non-technical stakeholder does, and
everything past it an engineer stepping up for accountability. A board that shows only its own
branch fails the first half; a card in flight with nobody's name on it fails the second, because
nothing says who stepped up.

## Measures

- **Primary**: `opensprint compact board --all-branches` lists the card every local and remote-tracking `opsp/*` branch carries, alongside the checkout's own, picks the copy that is ahead where two differ, and writes nothing
- **Guardrail**: a card at `building`, `ready-for-attestation` or `attested` with no owner is reported `owner-undeclared` on the board
- **Workflow**: `/opsp:triage` claims an item when it picks it up and releases it when it returns it, `/opsp:apply` claims before it starts building, and `/opsp:backlog` never claims

### Bar

  as a    lead picking up backlog work, in any checkout
  I want  to see every initiative on every branch, and who holds each card in flight
  for     nobody to build what someone else already holds, or to miss what was filed elsewhere

- **dimension**: cross-branch visibility against a committed board that stays deterministic
- **chosen**: the committed `BOARD.md` shows the checkout alone; the cross-branch board is printed on demand from committed trees, and is only as current as the last fetch
- **traded for**: a stakeholder's agent reading `BOARD.md` still sees one branch; an owner is self-declared with `claim`, and nothing stops two people claiming on different branches before either pushes
- **neighbour**: the backlog on `main` while proposals stay on branches, the split [[DEC-029]]'s Invalidation Trigger names

### Posture

- **verdict**: met
- **attested-by**: Claude Opus 5.5 for Ivan Lee — the session that removed two citations from these templates and wrote this bar; the operator overrode DEC-043
- **attested-on**: 2026-10-18

Frame: `feat/opsp-board-owners` against `origin/main`, `492492b..634670f`, plus the uncommitted
working tree that lands in the same pull request — confirmed by the operator.

**Primary** is asserted in the library and through the CLI: the checkout's card, local branches and
remote-tracking branches are all collected, the checkout wins, and between two copies the fetched one
is shown only where it is strictly ahead — same commit, fetched ahead, local ahead, diverged, and a
remote with no local branch are each covered. `compact board --all-branches` prints local and fetched
cards, leaves `BOARD.md` byte-identical, and creates none where there was none. **Guardrail** is
asserted for exactly `building`, `ready-for-attestation` and `attested`, and its absence for
`exploring`, `proposed`, `completed` and `declined`. **Workflow** is asserted as instruction text, in
order: triage claims after the worktree exists, commits the claim and releases on return; apply claims
before `advance --to building`; backlog never claims. The `claim` command it relies on is tested end to
end. Nothing measures whether an agent follows those instructions.

### Evidence

- `test/core/board-branches.test.ts` — collection, precedence between copies, and that `BOARD.md` is never touched
- `test/cli-e2e/compact.test.ts` — `compact board --all-branches`, its `--json`, and that it writes nothing
- `test/core/board.test.ts` — the Owner column and `owner-undeclared` by state
- `test/core/opsp-board-owners.test.ts` — the triage, apply and backlog instructions
- `test/cli-e2e/claim.test.ts` — `opensprint claim`, `--owner`, `--release`, and that it never moves the state

## Implications

- Initiatives name an owner, and the workflows claim on pick-up: [[DEC-INITIATIVE-OWNER]]
- The cross-branch board is printed, never committed: [[DEC-BOARD-ALL-BRANCHES]]
