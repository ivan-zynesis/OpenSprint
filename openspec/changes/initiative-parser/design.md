## Context

Initiatives are the one artifact class with no code behind them. `DEC-024` records this as the obstacle it is: *"this milestone builds a parser before it builds a state machine."*

## Goals / Non-Goals

**Goals**
- Read an initiative's frontmatter, milestones and membership
- Resolve one by id rather than by filename

**Non-Goals**
- The state machine and its check — milestone 5
- Writing initiatives — `/opsp:backlog`, in `sdlc-operating-contract`
- `BOARD.md` — milestone 7

## Decisions

### Reuse `parseFrontmatter` rather than add a parser

`decision-map.ts` exports it and `records.ts` already reuses it for the same reason: a second frontmatter parser is a second set of edge cases, and the two would drift. This module imports it for the same reason.

### A milestone is a name, a description and a checkbox

Surveyed across all four initiatives in this repository, every milestone line has the form:

```
- [ ] <name>: <description>
- [x] <name>: <description>
```

The name is the opsx change name, which is what makes a milestone traceable to the branch that implemented it. A line with no colon is still a milestone — the whole text becomes its description and its name is empty — because reporting a malformed milestone beats dropping it silently.

### Membership tolerates the summary suffix

`## Driver Specs` carries bare ids; `## ADRs` in the newer initiatives carries `- DEC-018 — the six are maintainer's shipped section list`. Both forms are read by taking the leading token, so the two spellings cannot diverge into two parsers.

### Resolution tries `id` before filename

`DEC-036` will date-prefix initiative filenames, and every skill constructs `initiatives/<name>.md` today. Resolving by frontmatter `id` first makes the filename a view, exactly as it already is for driver-specs and decisions — and means the rename lands without touching a single skill.

Filename stem remains a fallback, so an initiative whose frontmatter is missing or malformed is still findable.

## Risks / Trade-offs

**Two initiatives could declare the same `id`.** The first wins by directory order, and the duplicate is reported rather than silently shadowing. A stronger guarantee would need a registry, which `DS-PARALLEL-EXEC` makes impossible across worktrees anyway.

**The parser is tolerant where it could be strict.** A missing `## Milestones` section yields no milestones rather than an error. That is deliberate: `DS-BACKWARD-COMPAT` requires an initiative written by an older release to keep parsing, and `parallel-universe-reconciliation` predates half the fields this reads.

## Migration Plan

None. Every existing initiative parses as written.

## Open Questions

None blocking.
