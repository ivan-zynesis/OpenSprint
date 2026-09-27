# maintainer — what must be true of it while it does that?

Records here are classified as **bars** (what must hold) and **posture** (where we actually sit
against them). The hat declares `bar · posture · evidence · exposure`; nothing is yet classified
as evidence or exposure.

## Charter

**Owns** the non-functional intent: what must remain true while OpenSprint does its job
(`DS-SQUAD-HATS`). In practice that is the safety of the surrogate, the compatibility bar across
releases, and the honest statement of where the project deliberately sits below its own standard.

**May not trade away:** the operator-only rule on reconciliation (`DS-HIGH-IMPACT-OPS`). It is
stated as absolute, not as a preference.

**Escalates when** a bar is stated without the trade that bought it — a constraint written so
nothing can check it is a constraint written badly (`DS-SQUAD-HATS`).

**The owner** reviews every change to this view and triages its open loops (`DS-SME-OWNERSHIP`).

## Constraints

### Bar — reconciliation is operator-invocable only

Universe reconciliation is high-impact and hard to reverse. It must never be triggerable by an
automated pipeline, a sub-agent, or another skill invoking it programmatically
(`DS-HIGH-IMPACT-OPS`).

The reasoning is blast radius: a corrupted surrogate degrades every downstream agent operation
that depends on it, and the damage is unbounded. So human confirmation at each ambiguous step is
non-negotiable, a planning phase must precede all execution, and the most capable available model
is recommended (`DS-HIGH-IMPACT-OPS`, `DEC-002`, `DEC-004`).

This bar is what `DEC-006` explicitly *releases* compaction from: because compact never writes a
record and every view regenerates, it cannot corrupt the surrogate, so it does not carry the
operator-only guardrail that `/opsp:rebase` and `/opsp:abandon` do.

### Bar — compatibility is best-effort, and means one specific thing

OpenSprint is released as open source. Backward compatibility is **best-effort** rather than
guaranteed: semver is the practice, npm the marketplace, and a published package is static
(`DS-BACKWARD-COMPAT`).

So the only surface that can break is one where **a new release meets a project whose
`openspec/` and `opensprint/` directories were written by an older version**. That is the bar, and
nothing else is.

What follows mechanically: a new field on a record is optional, so older records still parse;
removing or renaming a frontmatter field is a breaking change; migrations run forward rather than
requiring a re-init (`DS-BACKWARD-COMPAT`).

Best-effort is a consequence rather than a shortcut — a tool optimised for speed of evolution
cannot also promise never to move (`DS-BACKWARD-COMPAT`, `DS-SELF-USE-SCOPE`).

## Posture

### Self-use, and what that lets us accept

Tech giants and LLM providers could release tooling that does this better. **We do not intend to
compete.** OpenSprint exists to be evolved quickly for our own use, kept well documented, and to
give stakeholders maximum visibility into a well-organised agentic SDLC (`DS-SELF-USE-SCOPE`).

This is a position on a spectrum, not a law. Competing on feature parity with a provider that owns
the model would set the roadmap by someone else's release schedule; optimising instead for speed
of evolution and clarity of record keeps the tool useful on the day we need it.

**What the posture buys, and what it costs.** It is what makes an untested case acceptable — the
`devops` hat is empty here, and that is a recorded decision rather than an oversight
(`DS-SELF-USE-SCOPE`, `DEC-017`). The same posture accepts no GUI and no CI/CD surface, and pays
for it in discoverability: the tool is harder to pick up than a graphical one would be, which is
why the documentation burden is stated as a requirement rather than an aspiration.

The trade would stop being acceptable on adoption by people we do not talk to — `DEC-017` names
that as its invalidation trigger.

## Decisions

None assigned to this hat. The decisions answering these bars belong to `dev` — see
[dev.md](dev.md).

## Open Loops

**Harvested** (`DEC-013`):

- `constraint-unanswered` **DS-BACKWARD-COMPAT** — no active decision answers it. Every mechanism
  it implies is convention rather than a recorded decision.

**Structural:**

- **No charter record.** The charter above is inferred from the bars rather than from a record
  stating this hat's own boundary.
- **Nothing classified as `evidence` or `exposure`.** The hat declares four roles and uses two.
  Evidence is where rule harvesting would land for this hat — what proves each bar, and whether
  the proof can be trusted — and nothing records it yet.
- **No bar states its trade.** `DS-HIGH-IMPACT-OPS` and `DS-BACKWARD-COMPAT` both state a position
  without naming what was given up to sit there or what the neighbouring position would cost. That
  is the shape `hat-templates` will ask for.
