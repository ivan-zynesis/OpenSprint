---
id: DS-SURROGATE-BUDGET
type: reliability
status: active
created: 2026-09-26
---

# DS-SURROGATE-BUDGET: Surrogate Loading Must Not Consume the Session Budget

## Statement

Loading the surrogate must not consume the context budget that agentic work needs. Progressive discovery must extend one layer further than it does today: an agent must be able to work from a compacted surrogate rather than loading the full set of driver-specs and ADRs.

## Rationale

Measured across projects in production use (bytes divided by 4):

| Project | driver-specs | ADRs | architecture.md | DECISION-MAP | initiatives | `/opsp:apply` loads | `/opsp:explore` loads |
|---|---|---|---|---|---|---|---|
| cashier | 11K | 65K | 16K | 14K | 51K | ~106K | ~157K |
| overheard | 9K | 70K | 7K | 8K | 35K | ~94K | ~129K |
| ai-gateway | 10K | 64K | 8K | 12K | 34K | ~93K | ~127K |

Three observations drive the constraint:

1. **ADRs are 61–74% of every load.** That is the layer worth condensing.
2. **`architecture.md` is loaded alongside the ADRs it summarises**, so today's compaction saves nothing at load time. It works as documentation, not as a surrogate layer.
3. **Completed initiatives are loaded on every explore** — roughly 47K of cashier's 157K — although their durable output already lives in the driver-specs and ADRs.

## Implications

- The compacted surrogate is a genuine second tier of progressive discovery, not a summary document that sits beside the record
- Condensation is what earns the tokens; how the condensed output is partitioned is a separate concern answered by [[DS-SQUAD-HATS]]
- An agent that acts on a decision must still read that decision's full record — the budget is saved on orientation, not on judgement
