---
id: board-owners
title: board-owners
state: completed
owner: Ivan Lee
created: 2026-10-18
updated: 2026-11-03T15:30:12Z
branch: opsp/board-owners
---

Initiatives had no owner, and the board only showed the current checkout. Every backlog item lives on its own `opsp/<id>` branch ([[DEC-029]]), so `/opsp:triage` could not see items filed by anyone else, and nothing said who held a card once work began. [[DS-SURROGATE-GIT-CONTRACT]] and [[DEC-029]] both recorded the first as a deliberate, unsolved cost.

## Milestones

- [done] board-owners: initiative owners and `opensprint claim`, the Owner column and `owner-undeclared`, the cross-branch board, and claiming wired into backlog, triage and apply — built in `e9f43f9`, asserted by `test/core/board-branches.test.ts`, `test/core/opsp-board-owners.test.ts`, `test/cli-e2e/claim.test.ts` and `test/core/board.test.ts`

## History

- 2026-10-18T06:38:46Z  imported at completed from opensprint/initiatives/20261018-board-owners.md  by Ivan Lee
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20261018-board-owners.md  by Ivan Lee
