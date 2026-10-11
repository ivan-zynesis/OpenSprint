## 1. Propose writes the bar
- [x] 1.1 The driver-spec template gains `hats` and `role`
- [x] 1.2 It gains `## Measures` with `- **Primary**:`
- [x] 1.3 It gains `### Bar` with both per-hat BDD forms (`DEC-038`)
- [x] 1.4 It gains the four bar anatomy labels
- [x] 1.5 Names `constraint-unmeasurable` and `record-unclassified` as what fires without them
- [x] 1.6 Says an empty `## Measures` heading counts as absent
- [x] 1.7 Ask, do not invent; `- **Primary**: unstated` as the honest gap

## 2. Driver writes the bar
- [x] 2.1 The same frontmatter and body template
- [x] 2.2 A step that asks the operator for the bar where the role is `goal`
- [x] 2.3 The honest gap, with the loop named
- [x] 2.4 The scribe rule kept

## 3. The record
- [x] 3.1 `DEC-BAR-AT-PROPOSE`
- [x] 3.2 Reclassifies `/opsp:repropose` as `create`, by whose record it is
- [x] 3.3 Says why the Statement is still out of bounds
- [x] 3.4 Neither `DEC-027` nor `DEC-HAT-HANDOFFS` rewritten
- [x] 3.5 `DECISION-MAP.md` regenerated

## 4. Carried from the previous change
- [x] 4.1 `opsp-reideate-workflow`'s Purpose written — the archive left a placeholder

## 5. Verification
- [x] 5.1 Both tools assert the template, the labels and the forms
- [x] 5.2 The offered roles are checked against `DEFAULT_ROLES`, so the template cannot drift from the code
- [x] 5.3 The offered BDD labels are checked against `BAR_FORMS`
- [x] 5.4 tsc clean, lint clean, suite green apart from the pre-existing zsh-installer failures
