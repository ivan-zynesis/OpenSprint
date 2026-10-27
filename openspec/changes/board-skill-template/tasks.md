## 1. Columns and the template
- [ ] 1.1 `KANBAN_COLUMNS`: Backlog · Planning · Dev · Attestation · Done, by state and `held`; `columnOf`
- [ ] 1.2 `assets/kanban/board.html`: the static page, with config and cards markers; parses summary, milestones and history; no buttons yet
- [ ] 1.3 `renderBoardTemplate(config)`: reads the asset, writes the configuration as JSON with `<` escaped
- [ ] 1.4 `package.json` `files` and `flake.nix` ship `assets/`

## 2. The workflow
- [ ] 2.1 `opsp-kanban.ts`: skill `opensprint-kanban` and command `/opsp:kanban`, with list and render playbooks
- [ ] 2.2 The render playbook's template path is a placeholder, substituted per tool
- [ ] 2.3 Registered: `OPSP_WORKFLOW_IDS`, `getOpspSkillTemplates`, `getOpspCommandTemplates`, `skill-templates.ts`

## 3. Shipping
- [ ] 3.1 `writeOpspLayer`: opsp skills, opsp commands, and the template in every delivery mode
- [ ] 3.2 `init` uses it in place of its inline loop
- [ ] 3.3 `update` uses it in both paths: tools it updates, and newly configured tools
- [ ] 3.4 This repository's `opensprint-kanban` skill and `/opsp:kanban` regenerated; the hand-written proof of concept removed
- [ ] 3.5 `docs/workflows.md`: twenty workflows, `/opsp:kanban` listed

## 4. Tests
- [ ] 4.1 Every state lands in exactly one column for each answer to `held`
- [ ] 4.2 The template's script parses; it references nothing on the network; the config block is escaped
- [ ] 4.3 The shipped render playbook, run against a bare remote, writes a page holding every card in base64; the list playbook prints id, state and owner
- [ ] 4.4 `init` writes the skill, command and template; commands-only still writes the template; `update` writes the opsp layer
