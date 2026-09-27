## 1. PHILOSOPHY.md — the origin story

- [ ] 1.1 Head it as history, with the date it speaks for and a pointer to where current truth lives
- [ ] 1.2 Keep the founding argument intact — code became cheap; reasoning is the artifact routinely thrown away
- [ ] 1.3 Judge the six principles against `DS-AGENTIC-SDLC`: which held, which needed reframing, which was answered by the work
- [ ] 1.4 Close with what changed and why, naming the records that now hold it
- [ ] 1.5 Do not rewrite superseded claims into agreement with the present

## 2. README.md — the entry point

- [ ] 2.1 State what OpenSprint is now, citing `DS-AGENTIC-SDLC` rather than re-arguing it
- [ ] 2.2 Replace "Core Idea", "Why This Matters Now" and "Philosophy" with pointers into `opensprint/squad/`
- [ ] 2.3 Keep install, first cycle, and the command reference — what a README uniquely offers
- [ ] 2.4 Describe the four hats and the two maps, briefly, as orientation rather than as specification
- [ ] 2.5 Say plainly which documents are compiled and which are authored

## 3. Verification

- [ ] 3.1 No document outside `opensprint/` states current truth that a compiled view also states
- [ ] 3.2 Every link from `README.md` into the surrogate resolves
- [ ] 3.3 `pnpm test`, `tsc`, `lint` unchanged — no code touched
- [ ] 3.4 `node bin/openspec.js validate documentation-rewrite --strict` passes, exit code unpiped
- [ ] 3.5 `compact check` still green
