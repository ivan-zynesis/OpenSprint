## 1. PHILOSOPHY.md — the origin story

- [x] 1.1 Head it as history, with the date it speaks for and a pointer to where current truth lives
- [x] 1.2 Keep the founding argument intact — code became cheap; reasoning is the artifact routinely thrown away
- [x] 1.3 Judge the six principles against `DS-AGENTIC-SDLC`: which held, which needed reframing, which was answered by the work
- [x] 1.4 Close with what changed and why, naming the records that now hold it
- [x] 1.5 Do not rewrite superseded claims into agreement with the present

## 2. README.md — the entry point

- [x] 2.1 State what OpenSprint is now, citing `DS-AGENTIC-SDLC` rather than re-arguing it
- [x] 2.2 Replace "Core Idea", "Why This Matters Now" and "Philosophy" with pointers into `opensprint/squad/`
- [x] 2.3 Keep install, first cycle, and the command reference — what a README uniquely offers
- [x] 2.4 Describe the four hats and the two maps, briefly, as orientation rather than as specification
- [x] 2.5 Say plainly which documents are compiled and which are authored

## 3. Verification

- [x] 3.1 No document outside `opensprint/` states current truth that a compiled view also states
- [x] 3.2 Every link from `README.md` into the surrogate resolves
- [x] 3.3 `pnpm test`, `tsc`, `lint` unchanged — no code touched
- [x] 3.4 `node bin/openspec.js validate documentation-rewrite --strict` passes, exit code unpiped
- [x] 3.5 `compact check` still green

## 4. Verification result

- `tsc`, `eslint`, `validate --strict` clean; 1719 tests pass; `compact check` green
- Every link from both documents into the surrogate resolves
- No code touched

### What shrank

| | before | after |
|---|---|---|
| `README.md` | 404 lines | 150 |
| `PHILOSOPHY.md` | 159 lines | 152 |

The README lost half its length by deleting what the views now state — "The Core Idea", "Why This
Matters Now" and a "Philosophy" section that restated six principles. It also carried a command
table listing seven OPSX commands under `/opsp:` that do not exist; the workflow list is now
generated from what is actually registered.

### The spec caught the author

Draft one of `PHILOSOPHY.md` quoted the 93–157K measurement while telling the story of how
navigability was reframed. That is current truth in an authored document — precisely the drift
case this change's own spec defines, and the figure has already moved once during this initiative.
Replaced with a pointer to the record that holds it.

### Not covered

Neither document is under `compact check`. They are authored, so nothing asserts they stay
accurate; `README.md` is the exposed one, since a link can rot. A rule scanning markdown links
would close it, and is out of scope here.
