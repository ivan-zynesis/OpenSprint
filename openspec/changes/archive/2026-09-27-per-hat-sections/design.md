## Context

`SECTION_NAMES` is a fixed four-element `as const`, and `resolveSectionInputs` switches on it to decide what feeds each section. `classifyAll` iterates registry × SECTION_NAMES. The manifest types `section` as that union.

`DEC-010` requires per-section granularity — a new decision must restage `decisions` and leave `constraints` fresh — so sections cannot simply all take every record.

## Goals / Non-Goals

**Goals:**
- Sections defined per hat, with distinct input sets preserved
- Identical output for any project that does not declare sections
- A shape general enough for `hat-templates` to express bars, posture, topology and the rest without further engine work

**Non-Goals:**
- Defining the new hat shapes. That is `hat-templates`.
- Code as an input. That is `system-as-source`, and it adds an input kind rather than changing this model.
- Rendering. The skill is untouched; it reads sections from the plan.

## Decisions

**A section declares an input kind, not a hardcoded rule.** `all | driver-specs | decisions | none`, resolved the same way the current switch resolves it. This is the minimum that satisfies `DEC-010`: `constraints` taking `driver-specs` and `decisions` taking `decisions` is what makes a new ADR restage one and not the other. A section list without input kinds would force every section to take everything, collapsing the granularity the manifest exists to provide.

`system-as-source` will add a `code` kind. Designing the enum now means that milestone adds a variant rather than reworking the model.

**`hats` accepts both shapes.** An array of strings keeps its current meaning; a map from hat name to `{ sections }` is the new form. `DS-BACKWARD-COMPAT` requires the first: a project whose config was written by an older release must still parse, and `hats: [product, dev]` is that config.

```yaml
hats: [product, maintainer, dev, devops]        # unchanged, default sections

hats:                                            # new
  dev:
    sections:
      - { name: tech-stack, inputs: all }
      - { name: open-loops, inputs: none }
  product: {}                                    # declared, default sections
```

**A hat declaring no sections gets `DEFAULT_SECTIONS`.** Not an empty list. The alternative — requiring every hat to enumerate its sections once any hat does — would make adopting the feature a breaking change for the hats a project did not want to touch.

**Orphaned manifest entries are ignored, not reported.** When a project renames or drops a section, its old manifest entry matches no current section. `check` classifies only sections that currently exist, and `seal` simply does not rewrite the orphan. Reporting it would mean explaining a section the project no longer has, which is noise rather than drift — nothing is claiming anything about it.

**Section name to heading is mechanical.** A kebab-case name title-cases into the view heading: `open-loops` → `Open Loops`. No separate `heading` field until a project needs one that is not derivable, which keeps the config to one concept.

## Risks / Trade-offs

**`section` widens from a union to a string**, so the compiler stops catching a typo'd section name. Mitigated by validation: a section name absent from the hat's definitions is rejected at config-read time rather than at use, which is where the typo actually is.

**Two config shapes to parse.** Accepted — the alternative breaks every existing project. The resilient field-by-field parsing already in `readProjectConfig` handles a malformed variant by degrading to the default, so a half-written map does not fail the command.

**Cross-platform.** No new paths. Section names are config values compared case-sensitively, as hat names already are.
