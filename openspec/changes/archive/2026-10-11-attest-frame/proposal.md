## Why

`/opsp:attest` reviews a change and never established *what change*. No source branch, no base, no commit range. The operator had to say, in prose, which initiatives were in the pull request and what the branch contained.

That is the wrong way round. The attester is standing in a worktree; git already knows the branch, the base it merges into, and everything between. Worse, nothing was ever shown back — so the operator could not tell whether the attester had understood the scope, which is the one premise the whole review rests on.

## What Changes

- `src/core/change-frame.ts` — `resolveChangeFrame(projectRoot, base?)`: source, base, how the base was chosen, the fork point, commit **subjects**, a file-level stat, initiative ids touched, changes archived
- `opensprint frame` — the command, with `--base` and `--json`
- `/opsp:attest` gains **Step 1: Establish what you are attesting, and have it confirmed**, ahead of reading any bar; the remaining steps renumber
- `DEC-ATTEST-CHANGE-FRAME` — the decision, and where the line against `DEC-040` falls

## Capabilities

### Modified Capabilities
- `opsp-attest-workflow`: the review is framed and confirmed before a bar is read
- `opsp-git-branching`: how a base branch is resolved, and that the choice is reported

## Impact

- **This looks like reopening `DEC-040` and is not.** The frame carries commit subjects and a stat. It never carries a patch or a commit message body. The reasoning is in the design and in the decision record; it is the one judgement in this change worth disagreeing with.
- **The base is a guess, and the guess is shown.** `DEC-024`'s trunk resolution deliberately avoided `origin/HEAD` as misleading in a fork. That objection is answered by reporting which rule fired rather than by avoiding the signal.
- **Confirmation costs a round trip.** Deliberately. An inferred scope nobody agreed to is a premise nobody checked.
- **New**: `src/core/change-frame.ts`, `src/commands/frame.ts`
