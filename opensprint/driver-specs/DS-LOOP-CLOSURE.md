---
id: DS-LOOP-CLOSURE
type: architecture
status: active
created: 2026-09-26
hats: [product]
role: strategy
depends-on:
  - DS-FULL-COVERAGE
---

# DS-LOOP-CLOSURE: The Loop Must Close Mechanically

## Statement

The engineering loop must close:

```
   driver-spec ───────► ADR ───────► implementation ───────► rule
   a constraint         a decision   code or IaC             a check
   about the world      answering it                         that it holds
        ▲                                                       │
        └──────────── the rule fails ◄──────────────────────────┘
```

Each arrow is a skill or a hook rather than a meeting. Facilitation — noticing that a constraint has no decision, that a decision was never implemented, that an implementation has drifted from what was agreed — is the role an AI-native team does not fill with a person, because facilitation is exactly the part that can be encoded.

## Rationale

The last arrow is the one that matters. Without it, a process produces documents. With it, drift becomes a build failure rather than an archaeology exercise.

## Implications

- Compaction must detect open loops, not merely summarise closed ones
- A failing rule means an implementation and a decision disagree, and somebody has to decide which one was wrong — that is a triage input, not an error to suppress
- The compacted surrogate is itself subject to this constraint: it must not be able to disagree silently with the record it derives from — see [[DEC-010]]
