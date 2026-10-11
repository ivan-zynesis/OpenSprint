---
name: opensprint-driver
description: Manage driver specs — create, edit, or list the external truth documents that capture product, legal, compliance, reliability, architecture, and business constraints.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: opensprint
  version: "1.0"
  generatedBy: "0.0.9"
---

Manage driver specs in the `opensprint/driver-specs/` directory.

Driver specs are **operator-authored external truth** — facts about the world that the AI agent does not inherently know. They come from product requirements, legal mandates, compliance rules, reliability targets, or business constraints.

**CRITICAL RULE: You are a scribe for driver specs.** Only create, edit, or delete driver spec files when the operator explicitly instructs you to. Never autonomously modify driver specs. If you discover information that could be a driver spec during exploration or implementation, surface it to the operator and ask whether to record it.

---

## Actions

**Input**: The argument after `/opsp:driver` determines the action:
- `add <description>` — Create a new driver spec
- `edit <DS-ID>` — Edit an existing driver spec
- `list` — List all active driver specs
- No argument — Ask what the operator wants to do

### Add a Driver Spec

1. Ask the operator to describe the constraint if not already provided
2. Derive an ID in format `DS-<KEBAB-NAME>` (e.g., `DS-PRICING`, `DS-COMPLIANCE-SOC2`)
3. Ask the operator for the type: `product`, `legal`, `compliance`, `reliability`, `architecture`, or `business`
4. Create the file at `opensprint/driver-specs/<DS-ID>.md` with YAML frontmatter:

```markdown
---
id: DS-<KEBAB-NAME>
type: <type>
status: active
created: <YYYY-MM-DD>
hats: [<product|maintainer>]
role: <objective|goal|strategy>
---

<operator's description, faithfully recorded>

## Measures

- **Primary**: <the one thing that says whether this landed>

### Bar

<the BDD form for this hat — `DEC-038`. product: as a / I want / for.
 maintainer: given / when / then.>

- **dimension**: <the axis this sits on>
- **chosen**: <where on it, and the scope that applies to>
- **traded for**: <what was given up to sit here>
- **neighbour**: <the position not taken, or `unrecorded`>
```

5. **Ask the operator for the bar** where the role is `goal`. You are a scribe for the constraint
   and you are also the one who knows it will be reported without one — a `goal` with no populated
   `## Measures` fires `constraint-unmeasurable` on every compile. Ask; do not invent.

   Where the operator cannot state a bar yet, record `## Measures` with
   `- **Primary**: unstated` and say the loop will keep reporting it. An honest gap beats a
   fabricated target.

6. Confirm creation to the operator

### Edit a Driver Spec

1. Read the existing file at `opensprint/driver-specs/<DS-ID>.md`
2. Present the current content to the operator
3. Ask what they want to change
4. Apply the changes as instructed — do not embellish or interpret
5. If the change is fundamental (the constraint itself changed, not just wording):
   - Update the original's status to `superseded` with a `superseded-by` field
   - Create a new driver spec with the updated content and a `supersedes` field
   - Inform the operator that downstream decisions may need re-evaluation

### List Driver Specs

1. Read all files in `opensprint/driver-specs/`
2. Display active specs in a table:

| ID | Type | Summary |
|----|------|---------|
| DS-PRICING | product | Utility-based pricing, charge per invocation |
| DS-COMPLIANCE | legal | SOC2 Type II compliance required |

3. If there are superseded/deprecated specs, mention them briefly

---

## Guardrails

- **Never write without operator instruction** — This is the most important rule
- **Faithfully record** — Capture operator's words, not your interpretation
- **Use path.join()** — Construct all file paths cross-platform
- **Validate type** — Only accept: product, legal, compliance, reliability, architecture, business
- **Sequential IDs** — If operator doesn't suggest an ID, derive one from the content

