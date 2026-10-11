## 1. The bar form vocabulary
- [x] 1.1 `BAR_FORMS` — explicit map, two hats
- [x] 1.2 product: `as a / I want / for`; maintainer: `given / when / then`
- [x] 1.3 `dev` and `devops` absent, and nothing checked of them
- [x] 1.4 `parseBarForm(block, hat)` reports stated labels rather than a verdict
- [x] 1.5 Labels matched at line start, bulleted or bold, case-insensitively
- [x] 1.6 Labels buried in a sentence are not matched

## 2. The loop
- [x] 2.1 `bar-without-form` registered — eighteen kinds
- [x] 2.2 Fires on a bar in prose, naming the form the hat owes
- [x] 2.3 Fires on a partial form, naming the missing labels
- [x] 2.4 Silent where no bar was written, and where the hat declares no form
- [x] 2.5 Reported against the hat whose form it is, not every hat the record declares

## 3. The strategy sub-framework
- [x] 3.1 `SWOT_PARTS` — four, by explicit list
- [x] 3.2 `SWOT_SOURCES` — where in the ADR each part is compiled from
- [x] 3.3 `opportunity` documented as a deliberate redefinition

## 4. The skill
- [x] 4.1 `/opsp:compact` carries the SWOT table, the redefinition, and a worked example
- [x] 4.2 Says the cell is compiled from the ADR and never authored
- [x] 4.3 Says to write `unrecorded` rather than invent a part
- [x] 4.4 Carries both BDD forms with worked examples and the reason for the split
- [x] 4.5 Says posture, evidence and exposure stay prose
- [x] 4.6 Loop table updated with `bar-without-form` and `evidence-unresolvable`

## 5. Documentation
- [x] 5.1 `docs/concepts.md` loop table carries `bar-without-form`

## 6. Verification
- [x] 6.1 Unit tests for `BAR_FORMS`, `parseBarForm`, `SWOT_PARTS`, `SWOT_SOURCES`
- [x] 6.2 Loop tests for every branch, including the per-hat attribution
- [x] 6.3 Skill tests for both sub-frameworks
- [x] 6.4 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
