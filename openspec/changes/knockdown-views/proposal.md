## Why

Milestone 4 of `surrogate-currency`.

`/opsp:knockdown` already invokes `/opsp:compact` at Step 5, so the hat views *are* produced — but nothing in the workflow says so, the completion summary lists only `architecture.md`, ADRs and the decision map, and the skill describes itself as reverse-engineering three things. The two most informative artifacts of a brownfield surrogate are generated and then not mentioned.

They are informative precisely because they are **empty**. A driver-spec inferred from code is `observed` — an account of what the code does. Its `role` and `objective` are statements of *intent*, which code does not carry, so knockdown cannot assign them and should not try. The result is `dev` and `devops` populated, `product` and `maintainer` empty, which is the most useful thing a reverse-engineered surrogate can say.

## What Changes

- Step 5 states that **all five views** are compiled, and what to expect of each
- The empty `product` and `maintainer` views are framed as **the finding**, not as a gap to be filled in
- Knockdown explicitly does **not** assign `role` or `objective` to an inferred driver-spec, because intent is not observable from code
- The completion summary reports the views, and names the seven unanswered maintainer objectives as the onboarding question list
- The skill's own description stops omitting them

## Capabilities

### Modified Capabilities
- `opsp-knockdown-workflow`: the compile produces all five views, and the empty ones are reported as a finding

## Impact

- **No behavioural change to compaction.** Step 5 already delegates to `/opsp:compact` (`DEC-014`); this makes what that produces visible and interpreted.
- **Prose only.** No code.
- **Modified**: `src/core/templates/workflows/opsp-knockdown.ts`
