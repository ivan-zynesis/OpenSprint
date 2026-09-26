# maintainer — what must be true of it while it does that?

## Charter

Not established as a recorded accountability. The hat's scope here is inherited from the general
model — non-functional constraints, what must remain true while the system does its job
(`DS-SQUAD-HATS`) — and its owner reviews changes to this view, receives escalations in its
domain, and triages its backlog (`DS-SME-OWNERSHIP`).

No record states what this hat may not trade away, or when it escalates. See Open Loops.

## Constraints

**Compatibility is best-effort, and it means one specific thing.** OpenSprint is a self-use tool
released as open source, so backward compatibility is maintained on a best-effort basis rather
than guaranteed (`DS-BACKWARD-COMPAT`). Semver is the practice and npm is the marketplace.

A published package is static — it does not change after release — so the only surface that can
break is the one where **a new tooling release meets a project whose `openspec/` and
`opensprint/` directories were written by an older version** (`DS-BACKWARD-COMPAT`). That is the
compatibility bar, and nothing else is.

Best-effort rather than guaranteed is a consequence, not a shortcut: a tool optimised for speed
of evolution cannot also promise never to move (`DS-BACKWARD-COMPAT`, `DS-SELF-USE-SCOPE`).
Stating the bar honestly beats quietly failing a stronger one.

**What follows mechanically** (`DS-BACKWARD-COMPAT`):
- a new field on a record is optional, so older records still parse
- removing or renaming a frontmatter field is a breaking change under semver
- migrations run forward against an existing project rather than requiring a re-init

## Decisions

None. No decision record is assigned to this hat.

That is worth noticing rather than passing over: the compatibility bar above is stated as a
constraint but no recorded decision says how it is *met* — see Open Loops.

## Open Loops

**Harvested** (`DEC-013`):

- `constraint-unanswered` **DS-BACKWARD-COMPAT** — no active decision answers this constraint.
  Every mechanism it implies — optional fields, forward migrations, semver discipline — is
  convention rather than a recorded decision. This is the only constraint in the project with no
  decision behind it.

**Structural:**

- **No charter record.** Nothing states what this hat may not trade away or when it escalates.
