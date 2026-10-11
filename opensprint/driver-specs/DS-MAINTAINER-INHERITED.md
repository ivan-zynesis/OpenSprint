---
id: DS-MAINTAINER-INHERITED
type: architecture
status: active
created: 2026-10-01
hats: [product]
role: strategy
depends-on:
  - DS-SQUAD-HATS
---

# DS-MAINTAINER-INHERITED: The Maintainer Hat Has Inherited Objectives, Not Discovered Ones

## Statement

The `maintainer` hat is a **branch of product** — the technical product manager. It runs the same OGSM framework, with one difference that carries everything:

**Product's objective is discovered per project. Maintainer's objectives are inherited.**

They are the technical concerns present in substantially every software project, which is why the accountability spun off from product and is held by a specialist. There are seven:

| # | Objective | Owns |
|---|---|---|
| i | **security & access** | authentication, authorisation, secrets, who may do what |
| ii | **isolation & confidentiality** | tenancy, blast radius, separation of concerns under failure |
| iii | **privacy, retention & legal** | data lifecycle, jurisdiction, statutory obligation |
| iv | **integrity & correctness** | the system does what it says, and its data stays true |
| v | **change & quality** | release safety, test adequacy, the cost of moving |
| vi | **availability & continuity** | staying up, and coming back — uptime, failure recovery, disaster continuity |
| vii | **cost & budget** | what it costs to run and maintain |

Each reads as a full objective with its hat prefix implied: *"to meet security & access at a stated standard."*

Beneath each sits a Goal, a Strategy and a Measure. The hat's view is therefore a **grid**, and its empty cells are its most informative content.

```
                          | Goal        | Strategy (the bar) | Measure
 -------------------------+-------------+--------------------+--------------
  security & access       | ...         | ...                | SOC2 CC6.1
  isolation & confidential| ...         | ...                | -
  privacy, retention&legal| ...         | -                  | -
  integrity & correctness | ...         | ...                | ...
  change & quality        | ...         | ...                | ...
  availability&continuity | ...         | ...                | SLO 99.9 / RTO 4h
  cost & budget           | -           | -                  | -
```

## Rationale

[[DS-SQUAD-HATS]] establishes that a hat is a context boundary and that the four accountabilities produce different *kinds* of knowledge. It did not say what shape `maintainer` takes, which is why this tool ships a default shape for `product`, `dev` and `devops` and **nothing for `maintainer`** — the shape in use was authored by hand into this repository's own `openspec/config.yaml`.

Practice across projects produced the answer. OGSM fits, because maintainer is doing product management against technical rather than market outcomes. What does not fit is a *discovered* objective: every project's maintainer asks the same six questions, and a framework that makes each project rediscover them wastes the specialist.

Six objectives does not break OGSM's "one narrative objective" reading, because plurality here is inherited rather than invented. The operator does not choose six; the domain supplies them.

**Why `cost & budget` and not `economics`.** Economics is the business model — selling price, margin, unit economics — and it is worked out *with the product team* against business strategy. The maintainer hat owns only what the system costs to run and maintain. Naming the objective `economics` would pull a product accountability across a hat boundary.

**Why `availability & continuity` and not `Site Reliability`.** The other six name a *concern* as a descriptive pair. SRE names a practice and a job title, and "site" reads oddly for a CLI, a library or a batch system. The chosen name also separates the two things it covers: availability is uptime, continuity is recovery and disaster planning. SRE belongs in the Measure column, where SLO, SLI, error budget, RTO and RPO land.

It is a genuine seventh rather than a redundant one. Nothing else covers it: a system that is down is *absent*, not incorrect, so `integrity & correctness` does not reach it; `change & quality` covers not breaking it when you change it, not staying up under load; `isolation` bounds a failure's blast radius but says nothing about recovery; and `cost & budget` touches capacity only as a spend trade.

As with every other row, maintainer owns the **bar** — what uptime is committed to — while `devops` owns how the system is stood up to meet it.

## Measures

- **Primary**: a maintainer bar recorded on any project routes to exactly one of the seven without strain
- **Coverage**: every objective renders, including those with nothing recorded — an empty row is the finding

### Posture

- **verdict**: partially met
- **attested-by**: Ivan Lee
- **attested-on**: 2026-10-11

Exclusive routing by the `objective` field is asserted (`test/core/hat-templates.test.ts`,
`test/core/classification.test.ts`), and an objective with no records resolves to an empty section
rather than vanishing. No test asserts the **compiled view** renders that empty row; the knockdown
test titled "seven objectives" checks five. No test shows an off-list objective value being
reported. *"Without strain"* is not testable.

### Exposure

A record carrying a misspelled or off-list objective may route nowhere without being reported, and
an empty objective row could disappear from the compiled view without failing a test.

## Implications

- The six are a shipped section list, not records: [[DEC-018]]
- A maintainer strategy stays above domain know-how: [[DS-STRATEGY-ALTITUDE]]
- Each measure carries its own anatomy: [[DS-MEASURE-ANATOMY]]
- `bars · posture · evidence · exposure` — the shape this repository authored by hand — is re-seated rather than discarded
