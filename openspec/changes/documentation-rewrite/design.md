## Context

`DS-DOCUMENTATION-AS-OUTPUT` says documentation is compiled rather than authored. Taken literally that would mean deleting both files, which is wrong — a compiled view cannot tell you why a project exists, because that is a story rather than a state.

So the change is a boundary, not a deletion: what is authored, what is compiled, and what each is allowed to claim.

## Goals / Non-Goals

**Goals:**
- One source of truth for what OpenSprint is, and it is the surrogate
- `PHILOSOPHY.md` honest about being history
- `README.md` useful to someone who has never seen the project, without duplicating the views

**Non-Goals:**
- Deleting either document. Origin and entry point are genuinely authored work.
- Rewriting the docs under `docs/`. They cover CLI usage and remain accurate.
- Changing any record. The records already say what these documents point at.

## Decisions

**Authored and compiled are separated by what they claim, not by who wrote them.**

| | Claims | Drifts? |
|---|---|---|
| compiled — `squad/*`, `architecture.md` | what is **true now** | cannot; `compact check` fails |
| authored — `PHILOSOPHY.md` | what was **thought then** | cannot go stale; history does not change |
| authored — `README.md` | where to **find** what is true | only if a link rots |

A document that states current truth and is not compiled is the drift case. Neither survivor does that: one is dated, the other delegates.

**`PHILOSOPHY.md` is dated rather than deleted.** A view compiled from records can say what the system is; it cannot say why anyone started. The document is marked as of its time, its claims left standing as what was believed then, with what followed noted at the end. Rewriting it to agree with the present would destroy the only record of how the thinking moved.

**`README.md` links rather than restates.** Its current "Core Idea", "Why This Matters Now" and "Philosophy" sections say what `squad/product.md` now says, compiled and cited. Restating them creates a second surrogate that nothing checks. What a README uniquely offers — install, first cycle, where to go next — stays.

**The six principles are judged against the objective, not preserved out of loyalty.** Three hold unchanged. Two predate the hat model and the dev/sec/ops framing and need reframing. One — *clear, not simple* — turns out to have been answered by building the thing rather than by argument, and the honest move is to say how.

## Risks / Trade-offs

**A dated document invites nobody to maintain it.** That is the intent, and the header says so, but a reader skimming may still take a 2026 claim as current. Mitigated by the date being the first thing on the page and by every current claim carrying a pointer to the record that holds it.

**A linking README is worth less offline**, and someone reading on npm cannot follow a relative path into `opensprint/`. Accepted: the alternative is a second copy that drifts, and `DS-DOCUMENTATION-AS-OUTPUT` chose against exactly that.

**Neither file is covered by `compact check`.** They are authored, so nothing asserts they stay accurate. `README.md` is the exposed one, since a link can rot — worth a rule eventually, and out of scope here.
