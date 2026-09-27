## Context

`DEFAULT_SECTIONS` is a single array shared by every hat. `SectionDef` carries `inputs` (record kind) and `observes` (files). Records carry `role`. Nothing yet connects a role to a section.

`DS-BIG-PICTURE` settles what a view is for: a section earns its place by conveying the domain, not by giving every record somewhere to live.

## Goals / Non-Goals

**Goals:**
- Four shapes that convey their domains rather than indexing their records
- Granularity that survives: adding a strategy must not restage the objective
- A measure gap that is detectable rather than a matter of opinion

**Non-Goals:**
- Rewriting `PHILOSOPHY.md` or `README.md`. That is `documentation-rewrite`, sequenced after this so the compiled views exist to point at.
- Interpreting observed files. The engine hands paths to the renderer; understanding a lockfile is synthesis.
- Enforcing that a view actually uses its sections well. A shape is scaffolding, not a guarantee.

## Decisions

**Sections default per hat, with a fallback for hats the tool does not know.** A project declaring a `designer` hat gets the generic four rather than an empty view, because an unknown hat is not an error — `DS-SQUAD-HATS` makes the hat set a project's own.

**A section may filter its inputs by role.** `SectionDef` gains `roles?: string[]`. Without it every product section would take all driver-specs, share an input hash, and restage together — losing exactly the granularity `DEC-010` exists for. With it, `objective` takes role `objective` and nothing else.

**Product keeps a `measures` section even though `measure` is not a role.** The two are not in tension: a measure lives *inside* a goal record as a `## Measures` section, and the view's `measures` section aggregates across goals. That aggregate is where rule harvesting lands for product — what we said we would measure, and what actually asserts it. It is the QA bridge, rendered.

**Maintainer's `bars` section asks for the trade, not just the position.** A bar is a point chosen on a spectrum: dimension, chosen point with its scope, what was given up to sit there, and what the neighbouring point would cost. Stating a bar without its trade reads like a law of nature when it was a purchase somebody made, and the receipt is what a maintainer picking up the hat actually needs.

**`constraint-unmeasurable` fires only for roles that state a target.** `MEASURABLE_ROLES` is `goal` and `bar`, by explicit list. An objective is qualitative by definition and a strategy is an approach, not a target; demanding measures of either would train people to write fake ones.

**Diagram convention is detected, with three outcomes.** No mermaid anywhere means the repository's habit is ASCII. Three or more files means it is a habit. One or two means somebody tried it once, and the skill asks rather than guessing. The thresholds are a heuristic and the code says so; what matters is that the ambiguous case routes to a human, which is what was asked for.

Measured across the projects at hand: overheard 0 files, cashier 1, ai-gateway 1, pixlr-web 7, this repository 2. Most land in the ambiguous band, which is the case worth handling well.

**ASCII is the default, not the preference.** It survives a terminal, a diff and an agent's context with no renderer. Mermaid earns its place where a graph outgrows ASCII — an entity schema with twenty tables, a pipeline with ten nodes — and the skill is told to judge per diagram rather than per repository.

## Risks / Trade-offs

**Three of four shapes cannot be validated here.** This repository has no devops records and three maintainer ones. The shapes are designed against cashier's data — eleven maintainer-domain records, a real pipeline inventory, an entity schema — and validating them properly means running compact there.

**Every view re-renders at once.** Unavoidable: the shapes change. It does mean the diff is large and the comparison against the old views is by reading rather than by patch.

**A shape can be filled badly.** Nothing stops a renderer writing `tech-stack` as a list of ADRs. The instruction says what each section is for and the sections have distinct inputs, but the guarantee is weak and honest about being so.

**Cross-platform.** Default observation globs use forward slashes, which `fast-glob` normalises; no path is constructed by hand.
