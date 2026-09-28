---
id: DS-DOCUMENTATION-AS-OUTPUT
type: product
status: active
created: 2026-09-27
hats: [product]
role: goal
depends-on:
  - DS-AGENTIC-SDLC
---

# DS-DOCUMENTATION-AS-OUTPUT: Documentation Is Compiled, Never a Second Effort

## Statement

Documentation is a large part of engineering, and it must not be a separate effort. **The compacted surrogate is the documentation** — compiled from work already done, never authored alongside it.

## Rationale

Documentation fails for a structural reason, not a discipline one: it is written after the fact, by someone with no remaining incentive, describing decisions whose reasoning has already faded. Every practice that treats it as a task to be nagged into existence produces the same result.

Compiling it removes the second effort entirely. The driver-specs and decision records are made *during* the work, because the work cannot proceed without them — an agent needs the constraint to act on it and the decision to stop re-asking. Rendering those into something a person reads costs nothing extra.

This is what makes the artifact honest as well as cheap. A compiled document cannot drift from what it describes without the compile reporting it, which is a guarantee no authored document has ever offered.

## Measures

- **Primary**: no documentation artifact is hand-authored where a compiled one would serve
- **Guardrail**: a compiled artifact that disagrees with its sources fails the build — see [[DEC-010]]

## Implications

- Views are compiled and never hand-edited: [[DEC-006]]
- What a compiled view is for, rather than what it contains: [[DS-BIG-PICTURE]]
- Narrative documents that are genuinely authored — an origin story, an entry point — stay authored, and say so
