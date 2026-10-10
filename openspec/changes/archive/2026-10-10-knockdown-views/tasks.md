## 1. The compile step

- [x] 1.1 Step 5 states that all five views are produced, not only architecture.md
- [x] 1.2 Say what to expect of each: dev and devops populated, product and maintainer empty
- [x] 1.3 Frame the empty views as the finding, with the wording that makes them read as questions

## 2. Not inventing intent

- [x] 2.1 State that an inferred driver-spec carries no `role` and no `objective`
- [x] 2.2 Say why — intent is not observable from code, and a guess renders as fiction

## 3. The summary

- [x] 3.1 Report the views alongside the records
- [x] 3.2 Name the maintainer objectives with nothing recorded
- [x] 3.3 State that the whole surrogate is `observed`, nothing decided or attested
- [x] 3.4 Update the skill's own description, which omitted the views

## 4. Verification

- [x] 4.1 Tests that the instructions produce all five and say what to expect
- [x] 4.2 Test that role and objective are explicitly not assigned, with the reason
- [x] 4.3 Test that empty views are framed as a finding
- [x] 4.4 Test that the summary names the objectives and states `observed`
- [x] 4.5 `pnpm test` green apart from the known flaky zsh-installer file
- [x] 4.6 `pnpm exec tsc --noEmit` clean, `pnpm lint` clean

## 5. Discovered during implementation

- [x] 5.1 **The views were already being produced.** Step 5 has delegated to `/opsp:compact` since knockdown was written, so all five views were compiled all along — the workflow just never said so, the summary listed only records, and the skill described itself as reverse-engineering three things. The gap was entirely in what knockdown *told* the operator it had done, which meant the two most informative artifacts of a brownfield surrogate were generated and then not mentioned.
