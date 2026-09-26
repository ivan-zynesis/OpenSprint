---
id: DS-SQUAD-HATS
type: architecture
status: active
created: 2026-09-26
hats: [product]
---

# DS-SQUAD-HATS: Engineering Accountability Partitions Into Four Hats

## Statement

Engineering accountability partitions into four hats. The roles are unchanged from a traditional squad — somebody still has to decide what the system must do, somebody still has to decide it is safe — but one person may wear several, and an agent must be told which one it is wearing. A hat is a context boundary: wearing it means knowing what that role is accountable for, what it produces, and which constraints it may not trade away.

| Hat | Owns the question | Produces |
|---|---|---|
| product | what must it **do**? | functional driver-specs |
| maintainer | what must be **true of it** while it does that? | non-functional driver-specs |
| dev | how is it **built**? | application code, ADRs, architecture |
| devops | how is it **stood up and kept running**? | infrastructure as code |

The hats group however team size demands. **The accountabilities do not move.**

Two hats produce driver-specs in one format. A constraint is a constraint whether it reads "multiple payment rails with divergent semantics" or "99.9% monthly, and the topology follows from it".

## Rationale

A traditional squad splits work across people. An AI-native squad splits it across hats, because the team is small and much of the execution is done by agents. Organising by role rather than by document type is what makes a hat a usable context boundary for an agent.

## Implications

- **QA is redistributed, not absent.** The person who can most cheaply make something verifiable is the person building it, so engineers write the automated tests. But *what must be tested* is answered upstream by the driver-specs. QA is therefore the bridge between specification and assertion, and that bridging work lands mostly on the product and maintainer hats — a constraint written so that nothing can check it is a constraint written badly.
- **Designer is product-dependent.** A system whose only surface is a back-office dashboard can derive its design from the functionality it exposes. A product with a consumer surface needs the hat. The hat set is therefore a per-project choice, not a fixed list — see [[DEC-012]].
- **Hats are an ownership partition, not a loading filter.** Measured against cashier's six initiatives, four touch all four hats and none touches fewer than two. Real work spans the hats — which is precisely why one person wears all of them.
