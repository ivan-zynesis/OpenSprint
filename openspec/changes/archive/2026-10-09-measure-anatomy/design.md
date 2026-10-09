## Context

`DEC-019` decides the measure anatomy renders as optional sub-blocks under the existing `## Measures` section, rather than as separate records or as frontmatter. This change is that decision, plus the migration it enables.

## Goals / Non-Goals

**Goals**
- Parse the four sub-blocks, all optional
- Harvest the gaps they expose
- Migrate this repository's two bars and remove milestone 1's pin

**Non-Goals**
- Writing posture, evidence or exposure — that is `/opsp:attest`, milestone 9
- `mitigated-by` forward edges — milestone 10
- Rendering the anatomy in a view — the skill's half, unchanged here

## Decisions

### Sub-blocks, not frontmatter

Chosen in `DEC-019` and unchanged: these hold prose, and YAML is hostile to paragraphs. Reusing `## Measures` means the existing `constraint-unmeasurable` harvest keeps working untouched, and a record written before this change still parses.

### A Bar is labelled lines, read by explicit lookup

```markdown
### Bar
- **dimension**: automation ←→ human confirmation
- **chosen**: fully manual
- **traded for**: every scrap of automation on these two operations
- **neighbour**: unrecorded — nothing says what partial automation would cost
```

Four labels, held in a constant and looked up by name. Not a regex hunt across the block: this codebase prefers explicit lookups, and a bar's parts are a fixed vocabulary rather than an open set.

### `unrecorded` is a stated neighbour

`bar-without-neighbour` fires when the **label is absent**, not when its value says "unrecorded". Saying so explicitly is an honest answer, and `DS-MEASURE-ANATOMY` already reasons this way about posture: the honest position where nothing is set beats silence. A rule that punished honesty would train people to omit the line.

### Evidence and exposure are checked for presence, not content

`measure-unasserted` and `measure-unexposed` fire on an absent or empty sub-block. Neither inspects what the block says — whether evidence is *good* evidence is `/opsp:attest`'s judgement, and `DEC-032` will require it to reference a CI artifact. Presence is what code can check.

## Risks / Trade-offs

**Loop counts rise on existing projects.** Every record with measures and no evidence now reports. That is the finding working, but a project adopting this version sees a jump it did not cause. Accepted: `DEC-023` keeps loops reported rather than gated, so nothing breaks.

**The two migrated records lose their `bar` role.** `DS-HIGH-IMPACT-OPS` and `DS-BACKWARD-COMPAT` become `role: strategy` with the bar as a sub-block under their measures. Anything citing them by id is unaffected; `role: bar` disappears from this repository entirely, which is the point.

**`MEASURABLE_ROLES` still contains `bar`.** Left in place deliberately: another project may still use `role: bar`, and removing it would break their `constraint-unmeasurable` harvest. `DS-BACKWARD-COMPAT` requires older records to keep parsing.

## Migration Plan

Mechanical, two records:

| Record | Was | Becomes |
|---|---|---|
| `DS-HIGH-IMPACT-OPS` | `role: bar` | `role: strategy`, `objective: integrity-correctness` |
| `DS-BACKWARD-COMPAT` | `role: bar` | `role: strategy`, `objective: change-quality` |

Each gains a `## Measures` section carrying its bar — dimension, chosen, traded for, neighbour — taken verbatim from what `squad/maintainer.md` already compiled about them. Then `openspec/config.yaml` drops the `maintainer.sections` and `maintainer.roles` pin, and the shipped seven apply.

## Open Questions

Whether `risk` is a fifth part remains open on the initiative and does not block: adding a fifth sub-block later is additive in exactly the way these four are.
