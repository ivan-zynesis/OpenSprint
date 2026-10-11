## Why

Milestone 6 of `sdlc-operating-contract`, and the last. `DEC-037` and `DEC-038` each decided the *form* a cell takes, and neither form was anywhere a renderer could read it.

The two gaps are the same gap at different altitudes. A strategy cell renders a position and a citation, and stops — so a reader who wants to know what the position cost has to open the ADR, which is the thing a compiled view exists to spare them. A bar is prose, so `DS-CI-ATTESTATION` asks for an artifact assessing something nobody wrote down assessably.

## What Changes

- `BAR_FORMS` — the per-hat BDD vocabulary, as an explicit map: product's `as a / I want / for`, maintainer's `given / when / then`
- `parseBarForm(block, hat)` — what a bar block states, reported rather than judged
- `bar-without-form` — an eighteenth open loop, firing on a bar in prose in a hat that declares a form
- `SWOT_PARTS` and `SWOT_SOURCES` — the four parts and where in the ADR each is compiled from
- `/opsp:compact` carries both sub-frameworks, with worked examples and the reasoning that makes them non-arbitrary

## Capabilities

### Modified Capabilities
- `opsp-compact-skill`: the strategy and bar sub-frameworks
- `opsp-rule-harvesting`: a bar must take its hat's form

## Impact

- **Four existing driver-specs state a bar as a spectrum and will now be reported.** That is the rule working. They are maintainer bars, and `given / when / then` is what makes them assessable from a pipeline.
- **The spectrum labels are not replaced.** A bar now carries both — the spectrum says where it sits, the BDD says how CI tells you it is still there. See the design; this is the one place the two decisions could have been read as conflicting.
- **`dev` and `devops` declare no form**, and nothing is checked of them. They describe a system; they do not commit to a bar.
