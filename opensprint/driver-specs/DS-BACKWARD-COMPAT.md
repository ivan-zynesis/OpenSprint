---
id: DS-BACKWARD-COMPAT
type: reliability
status: active
created: 2026-09-26
hats: [maintainer]
role: strategy
objective: change-quality
---

# DS-BACKWARD-COMPAT: Best-Effort Backward Compatibility Across Tooling Releases

## Statement

OpenSprint is a self-use tool released as open source. Backward compatibility is maintained on a **best-effort** basis, not as a guarantee.

Semver is the practice. npm is the marketplace. A released package is static — it does not change after publication.

Backward compatibility therefore means one specific thing: **a new tooling release attempts to work with a project already running an earlier version of OpenSprint.**

## Rationale

The published artifact cannot break retroactively, because it does not change. The only compatibility surface that can break is the one where a newly released version meets a project whose `openspec/` and `opensprint/` directories were written by an older one.

Best-effort rather than guaranteed follows from [[DS-SELF-USE-SCOPE]]: a tool optimised for speed of evolution cannot also promise never to move. Stating the bar as best-effort is honest about the trade-off rather than quietly failing a stronger promise.

## Measures

- **Primary**: a project whose `openspec/` and `opensprint/` directories were written by an earlier release still parses under the current one

### Bar

- **dimension**: guaranteed compatibility ←→ speed of evolution
- **chosen**: best-effort, scoped to one surface — a new release meeting a project written by an older version
- **traded for**: the ability to move quickly, which [[DS-SELF-USE-SCOPE]] says is the point
- **neighbour**: unrecorded — nothing says what a guarantee would cost, or over what window

### Posture

Below what a product sold to strangers would hold, and deliberately so. A published package is static, so nothing can break retroactively; the only surface that can break is a new release meeting an older project.

## Implications

- A new field on a record must be optional, so records written by an earlier version still parse
- Removing or renaming a frontmatter field is a breaking change under semver
- Migrations, where offered, run forward against an existing project rather than requiring a re-init
- This is the one constraint on this project that belongs to the `maintainer` hat
