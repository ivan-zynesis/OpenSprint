## 1. Moves from the state machine
- [x] 1.1 `continueMove(state, held)`: the forward transition, excluding `declined`; triage's pick-up for unheld `exploring`
- [x] 1.2 `escalationMoves(state)`: every backward transition, labelled by an explicit map
- [x] 1.3 The moves table written into the board configuration

## 2. The agent table
- [x] 2.1 `ToolCommandAdapter.sessionLauncher` and `commandReference`, optional
- [x] 2.2 Claude Code: `['claude']` and `/opsx:<id>`
- [x] 2.3 `kanbanAgent(tool, delivery)`: name, launcher, and a prompt form per opsp workflow, command or skill
- [x] 2.4 `writeOpspLayer` writes each tool's agent into its template

## 3. The page
- [x] 3.1 Continue and escalate buttons, with hover text from the move
- [x] 3.2 The launch script: find or add the worktree, start the session; the prompt alone without a launcher
- [x] 3.3 Header actions: backlog an item, refresh
- [x] 3.4 This repository's kanban files regenerated

## 4. Tests
- [x] 4.1 The derived moves equal the ADR's table, per state
- [x] 4.2 No move leads to `declined`; `completed` offers nothing; every move is a legal transition or the pick-up
- [x] 4.3 Claude's agent launches with `claude`; a tool without a launcher, and skills-only delivery, get skill prompts
- [x] 4.4 The page script still parses, loads nothing and builds no HTML from text
