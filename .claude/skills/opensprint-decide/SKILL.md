---
name: opensprint-decide
description: Record a decision (ADR) when the agent encounters ambiguity that requires operator judgment. Creates a decision record with tradeoff analysis, rationale, and dependency tracking.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: opensprint
  version: "1.0"
  generatedBy: "0.0.9"
---

Record a decision in `opensprint/ADRs/` when genuine ambiguity requires operator judgment.

**WHEN to create a decision record:**
- You encounter a choice where multiple options are valid
- The right answer depends on operator judgment, organizational context, or business priorities
- Driver specs alone don't determine the answer — weighing tradeoffs is required

**WHEN NOT to create a decision record:**
- You can resolve the question from driver specs, best practices, or existing decisions
- The choice is an implementation detail with a clear best practice
- The decision is trivial and doesn't affect downstream choices

---

## Steps

1. **Present the ambiguity** to the operator:
   - Explain what question you've encountered
   - List the options you've identified with brief pros/cons
   - Reference relevant driver specs

2. **Get the operator's decision**:
   - Let the operator choose and explain their reasoning
   - Ask clarifying questions if the rationale is unclear

3. **Determine dependencies**:
   - Identify which driver spec IDs this decision traces to (`depends-on`)
   - Identify any prior decision IDs this builds upon
   - Calculate depth: 0 if depends only on driver specs, max(parent depths) + 1 otherwise

4. **Coin a semantic ID** — never a number (`DEC-036`):
   - `DEC-` followed by a short kebab-case phrase naming what was decided, in capitals
   - `DEC-ATTEST-NEVER-GATES`, `DEC-SCOPED-SEAL`, `DEC-KNOCKDOWN-ALL-VIEWS`
   - **Do not read the directory and increment.** Numbers collide across worktrees, which is
     what `DS-PARALLEL-EXEC` makes routine, and they tell a reader nothing: `(DEC-014)` in
     compiled prose requires a lookup that `(DEC-COMPACT-SINGLE-ENGINE)` does not.
   - Name it at the altitude of the decision, not the implementation, so it survives being
     superseded.
   - Existing `DEC-001`–`DEC-044` keep their numbers **permanently**. An id that changes is
     not an id, and they are cited in merged commits and compiled views. Never renumber one.

5. **Create the decision record** at `opensprint/ADRs/DEC-SEMANTIC-NAME.md`:

```markdown
---
id: DEC-SEMANTIC-NAME
status: accepted
depends-on:
  - DS-PRICING
  - DEC-001
created: YYYY-MM-DD
depth: N
---

## Question

[The ambiguity you raised, in your own words]

## Operator Decision

[The operator's chosen direction]

## Consideration Factors

| Factor | Weight | Option A | Option B |
|--------|--------|----------|----------|
| Cost model alignment | HIGH | Fixed cost matches ✓ | Per-request waste ✗ |
| Team familiarity | MED | Known stack ✓ | New learning curve ✗ |

## Rationale

[Reasoning linking the decision to the driver specs it depends on]

## Invalidation Trigger

[Conditions under which this decision should be re-evaluated.
e.g., "Re-evaluate if pricing model changes from subscription to utility-based"]
```

6. **Update DECISION-MAP.md**:
   - After creating the record, regenerate `opensprint/DECISION-MAP.md`
   - Read all decision records and driver specs
   - Rebuild the tree visualization with updated blast radii
   - See `/opsp:tree` for the regeneration logic

7. **Confirm** the decision was recorded and show its position in the tree

---

## Superseding a Decision

When the operator wants to change a previously accepted decision:

1. Update the original record: set `status: superseded` and add `superseded-by: DEC-NNN`
2. Create a new decision record with updated content and `supersedes: DEC-OLD`
3. Regenerate DECISION-MAP.md
4. Flag downstream decisions that may need re-evaluation

---

## Guardrails

- **Only record genuine ambiguity** — Don't create ADRs for choices you can resolve autonomously
- **Operator decides** — Present options, but the operator makes the call
- **Faithful recording** — Capture the operator's actual reasoning, not a sanitized version
- **Always update the decision map** — Every ADR change must be reflected in DECISION-MAP.md
- **Use path.join()** — Construct all file paths cross-platform

