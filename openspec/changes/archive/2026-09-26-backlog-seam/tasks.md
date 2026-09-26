## 1. Explore loads the backlog

- [x] 1.1 Add the harvest to `/opsp:explore`'s surrogate entry — run `opensprint compact loops --json` alongside reading the records
- [x] 1.2 Present loops grouped by accountable hat, with the kind and record for each
- [x] 1.3 Instruct the agent not to rank, score or recommend — choosing is the operator's call
- [x] 1.4 Instruct the agent to flag a deliberate absence and cite the record settling it, rather than proposing work to close it
- [x] 1.5 Continue without the backlog when the command cannot run, rather than failing the session

## 2. Propose records what it closed

- [x] 2.1 Add an optional `## Addresses` section to the initiative descriptor shape in `/opsp:propose`
- [x] 2.2 Each entry names the loop kind and the record it concerns; omitted entirely when the initiative did not arise from a loop
- [x] 2.3 State that it is prose rather than frontmatter, and that nothing marks a loop resolved — the next harvest is the source of truth

## 3. The loops output points at triage

- [x] 3.1 `opensprint compact loops` states that triage happens through `/opsp:explore` and `/opsp:propose` when it reports any loop

## 4. Tests

- [x] 4.1 Explore template runs `compact loops --json` and groups by hat
- [x] 4.2 Explore template carries the do-not-rank and deliberate-absence guardrails
- [x] 4.3 Explore template degrades rather than failing when the command is unavailable
- [x] 4.4 Propose template documents `## Addresses`, its omission, and that no loop state is kept
- [x] 4.5 `compact loops` output names both triage workflows when loops exist, and does not when there are none

## 5. Verification

- [x] 5.1 `pnpm test` — no new failures beyond the known `zsh-installer` isolation defect
- [x] 5.2 `pnpm exec tsc --noEmit` clean
- [x] 5.3 `pnpm lint` clean
- [x] 5.4 `node bin/openspec.js validate backlog-seam --strict` passes
- [x] 5.5 Run `compact loops` and confirm the triage line appears, and that this repository's 10 loops are the ones an explore session would be handed

## 6. Verification result

- `tsc`, `eslint` and `validate --strict` clean; 1601 tests pass, up 13
- The 18 remaining failures are the known `zsh-installer` isolation defect
- `compact loops` prints the triage line, and suppresses it when there is nothing to triage
- This repository's 10 loops are what an explore session is now handed: 7 unguarded decisions,
  `DS-LOOP-CLOSURE` and `DS-SELF-USE-SCOPE` unasserted, `DS-BACKWARD-COMPAT` undecided
