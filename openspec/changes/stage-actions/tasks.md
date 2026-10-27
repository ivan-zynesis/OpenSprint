## 1. Moves from the state machine
- [ ] 1.1 `continueMove(state, held)`: the forward transition, excluding `declined`; triage's pick-up for unheld `exploring`
- [ ] 1.2 `escalationMoves(state)`: every backward transition, labelled by an explicit map
- [ ] 1.3 The moves table written into the board configuration

## 2. The agent table
- [ ] 2.1 `ToolCommandAdapter.sessionLauncher` and `commandReference`, optional
- [ ] 2.2 Claude Code: `['claude']` and `/opsx:<id>`
- [ ] 2.3 `kanbanAgent(tool, delivery)`: name, launcher, and a prompt form per opsp workflow, command or skill
- [ ] 2.4 `writeOpspLayer` writes each tool's agent into its template

## 3. The page
- [ ] 3.1 Continue and escalate buttons, with hover text from the move
- [ ] 3.2 The launch script: find or add the worktree, start the session; the prompt alone without a launcher
- [ ] 3.3 Header actions: backlog an item, refresh
- [ ] 3.4 This repository's kanban files regenerated

## 4. Tests
- [ ] 4.1 The derived moves equal the ADR's table, per state
- [ ] 4.2 No move leads to `declined`; `completed` offers nothing; every move is a legal transition or the pick-up
- [ ] 4.3 Claude's agent launches with `claude`; a tool without a launcher, and skills-only delivery, get skill prompts
- [ ] 4.4 The page script still parses, loads nothing and builds no HTML from text
