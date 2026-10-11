## 1. /opsp:backlog
- [x] 1.1 New workflow template, registered in all three places
- [x] 1.2 Worktree created or switched before writing (DEC-029), never on main
- [x] 1.3 Writes the initiative at `state: exploring` and nothing else
- [x] 1.4 Drafts OGSM on the author's behalf; one question at most
- [x] 1.5 Stops without offering to proceed

## 2. /opsp:triage
- [x] 2.1 New workflow template, registered in all three places
- [x] 2.2 Loads the surrogate before judging
- [x] 2.3 Strategy brainstorming at architect altitude
- [x] 2.4 Advance / decline / return, with declining recording why
- [x] 2.5 Never formalizes, never advances silently

## 3. The surrounding workflows
- [x] 3.1 Explore offers backlog, shows both paths, still writes nothing
- [x] 3.2 Propose reads an existing initiative and does not duplicate it
- [x] 3.3 Propose does not rewrite an Objective or Goal

## 4. Verification
- [x] 4.1 Tests for registration, lifecycle order, and both instruction sets
- [x] 4.2 Tests that explore and propose were updated
- [x] 4.3 `pnpm test` green — 2013 passing
- [x] 4.4 tsc clean, lint clean

## 5. Discovered during implementation
- [x] 5.1 **A test asserted `/opsp:triage` would never exist.** `backlog-seam.test.ts` encoded `DEC-007`'s refusal of a fifth workflow by name. `DEC-039` has since introduced triage — which is not the *remediation* workflow `DEC-007` refused, but the thinking half of the propose stage. Kept the real intent (no `opsp-remediate`) and added a test asserting triage is not a remediation mechanism.
