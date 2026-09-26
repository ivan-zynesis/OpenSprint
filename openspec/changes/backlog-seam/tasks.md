## 1. Explore loads the backlog

- [ ] 1.1 Add the harvest to `/opsp:explore`'s surrogate entry — run `opensprint compact loops --json` alongside reading the records
- [ ] 1.2 Present loops grouped by accountable hat, with the kind and record for each
- [ ] 1.3 Instruct the agent not to rank, score or recommend — choosing is the operator's call
- [ ] 1.4 Instruct the agent to flag a deliberate absence and cite the record settling it, rather than proposing work to close it
- [ ] 1.5 Continue without the backlog when the command cannot run, rather than failing the session

## 2. Propose records what it closed

- [ ] 2.1 Add an optional `## Addresses` section to the initiative descriptor shape in `/opsp:propose`
- [ ] 2.2 Each entry names the loop kind and the record it concerns; omitted entirely when the initiative did not arise from a loop
- [ ] 2.3 State that it is prose rather than frontmatter, and that nothing marks a loop resolved — the next harvest is the source of truth

## 3. The loops output points at triage

- [ ] 3.1 `opensprint compact loops` states that triage happens through `/opsp:explore` and `/opsp:propose` when it reports any loop

## 4. Tests

- [ ] 4.1 Explore template runs `compact loops --json` and groups by hat
- [ ] 4.2 Explore template carries the do-not-rank and deliberate-absence guardrails
- [ ] 4.3 Explore template degrades rather than failing when the command is unavailable
- [ ] 4.4 Propose template documents `## Addresses`, its omission, and that no loop state is kept
- [ ] 4.5 `compact loops` output names both triage workflows when loops exist, and does not when there are none

## 5. Verification

- [ ] 5.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [ ] 5.2 `pnpm exec tsc --noEmit` clean
- [ ] 5.3 `pnpm lint` clean
- [ ] 5.4 `node bin/openspec.js validate backlog-seam --strict` passes
- [ ] 5.5 Run `compact loops` and confirm the triage line appears, and that this repository's 10 loops are the ones an explore session would be handed
