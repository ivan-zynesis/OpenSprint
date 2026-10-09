## Why

Milestone 4 of `lifecycle-beyond-build`, and the one that gives initiatives a deterministic half for the first time.

`decision-map.ts` parses driver-specs and decisions. Nothing parses initiatives. Every reference to `initiatives/` in `src/` is prose inside a skill template, which means an initiative's state, its milestones and its membership are legible to a model and invisible to code.

That blocks three things directly. `DEC-024` needs a state field that code can check against content. `DEC-026` needs `BOARD.md` compiled from initiative and milestone state. `DEC-036` needs initiatives resolvable by frontmatter `id` rather than by filename, so a date prefix does not break `/opsp:apply <name>`.

It also showed up as a bug the moment it mattered: `/opsp:apply` built a worktree from `main` while thirty-four planning records sat uncommitted, and nothing could tell that the initiative's own records were missing from the branch meant to implement them.

## What Changes

- New `src/core/initiatives.ts` — frontmatter, milestones, and membership, by the same parser `decision-map.ts` already uses
- A milestone is `{ name, description, done }`, read from `- [ ] name: description`
- Membership is read from the `## Driver Specs` and `## ADRs` list sections, tolerating the ` — summary` suffix those lists carry
- `resolveInitiative(dir, nameOrId)` resolves by frontmatter `id` first, then by filename stem

## Capabilities

### Modified Capabilities
- `opsp-initiative-artifact`: an initiative is readable by code — its state, its milestones and its membership

## Impact

- **Read-only.** Nothing writes an initiative yet; `DEC-024`'s state machine is milestone 5.
- **Tolerant of every existing shape.** All four initiatives in this repository parse, including `compact-surrogate` with its re-exploration log and `parallel-universe-reconciliation` with no `state` field at all.
- **Resolution by id is what unblocks `DEC-036`.** Date-prefixed filenames become possible without touching any skill that says `/opsp:apply <name>`.
- **New**: `src/core/initiatives.ts`, `test/core/initiatives.test.ts`
