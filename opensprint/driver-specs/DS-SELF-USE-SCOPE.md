---
id: DS-SELF-USE-SCOPE
type: product
status: active
created: 2026-09-26
hats: [product]
---

# DS-SELF-USE-SCOPE: A Self-Use Tool, Not a Competitor

## Statement

Tech giants and LLM providers — Anthropic, OpenAI and others — could release tooling that does this better than we do. **We do not intend to compete.**

OpenSprint exists to be evolved quickly for our own use, kept well documented, and to give us and our stakeholders maximum visibility into a well thought out and organised agentic SDLC.

## Rationale

Competing on feature parity with a provider that owns the model would set the roadmap by someone else's release schedule. Optimising instead for speed of evolution and clarity of record keeps the tool useful to us on the day we need it, and keeps its reasoning legible when we come back to it.

Being open source is a consequence of building in the open, not a bid for market share.

## Implications

- **No GUI.** The surface is the CLI plus the agent skill and command files it generates. See [[DEC-017]].
- **No CI/CD of its own.** The tool orchestrates work in other people's repositories; it does not ship a pipeline product.
- **The `devops` hat is legitimately empty for this project**, and a compiled view should report that honestly rather than render an empty section.
- Speed of evolution and clarity of the record beat feature parity when the two conflict.
