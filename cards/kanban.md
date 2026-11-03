---
id: kanban
title: kanban
state: building
owner: Ivan Lee
created: 2026-10-18
updated: 2026-11-03T15:41:32Z
branch: opsp/kanban
---

**Objective.** Initiative management that every agent and every human sees as one live state, no matter which worktree, branch or pull request the work currently sits in — and that holds up at the scale of a large, fast-moving monorepo.

## Milestones

- [done] board-store: the `kanban` branch layout and card format, created and seeded from the existing initiatives
- [done] board-skill-template: the list and render skill and the board template, shipped to adopters through `opensprint init` and `update`
- [done] stage-actions: each card's continue and escalate buttons, derived from the state machine, and the launch command, with the agent table taken from the command adapters
- [done] workflow-moves-card: every workflow that moves an initiative updates its card on `origin/kanban` through the opensprint command, including claims
- [done] resumable-workflows: triage, propose and attest resume from what the initiative already holds, so "continue" means resume
- [done] milestone-board: clicking an initiative opens its milestones as tickets, in the five opsx-cycle columns, with continue and change-request moves
- [specifying] board-stays-live: the change requested at attestation — every workflow's own move reaches the card, each bar has a test that asserts it, and the docs describe the live board

## History

- 2026-10-18T06:38:46Z  imported at exploring from opensprint/initiatives/20261018-kanban.md  by Ivan Lee
- 2026-10-18T06:38:55Z  owner unowned → Ivan Lee  by Ivan Lee
- 2026-10-18T06:38:55Z  exploring → proposed  by Ivan Lee — picked up
- 2026-10-18T06:39:05Z  proposed → building  by Ivan Lee — proof of concept started on opsp/kanban
- 2026-11-03T15:30:12Z  resynced milestones from opensprint/initiatives/20261018-kanban.md  by Ivan Lee
- 2026-11-03T15:41:32Z  milestone board-stays-live: todo → specifying  by Ivan Lee
