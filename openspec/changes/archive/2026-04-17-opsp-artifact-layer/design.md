## Context

OpenSprint's README describes a vision where every engineering decision is a durable, replayable event. The current codebase implements only the OPSX layer (change-level workflows). The OPSP layer — driver specs, decision records, decision tree — exists only as documentation. This design introduces the foundational artifact infrastructure that makes OPSP real.

The key insight driving this design: `opensprint/` and `openspec/` are two side-by-side directories with fundamentally different durability properties. `opensprint/` survives rebuilds; `openspec/` is regenerated. This physical separation IS the rebuild contract — `rm -rf openspec/ src/ && opsp:apply` is a valid operation.

## Goals / Non-Goals

**Goals:**
- Define the `sprint-driven` schema that extends `spec-driven` with OPSP artifact types
- Implement the `opensprint/` directory structure for durable artifacts
- Create templates for driver specs, decision records, and the decision map
- Build skill templates for the four foundational OPSP commands
- Integrate OPSP skill/command generation into the existing `init` flow when sprint-driven schema is active

**Non-Goals:**
- Initiative orchestration (squad charters, milestones, initiative reviews) — future work
- OPSP-aware versions of existing OPSX commands (`/opsp:propose`, `/opsp:apply`) — future work, depends on this foundation
- Migration tooling for converting existing projects to sprint-driven — future work
- Automated decision invalidation detection (the rebuild:assess skill surfaces decisions for manual re-evaluation, it does not auto-invalidate)

## Decisions

### Decision: Layered schema via `extends` field
**Choice:** `sprint-driven` schema declares `extends: spec-driven` rather than duplicating spec-driven artifacts or being a completely separate schema.

**Alternatives considered:**
- **Duplicate all artifacts in sprint-driven** — rejected: violates DRY, creates drift risk between the two schemas
- **Single schema with optional OPSP artifacts** — rejected: conflates two distinct concerns, makes spec-driven unnecessarily complex for users who don't want OPSP
- **Runtime composition without schema declaration** — rejected: implicit behavior, harder to reason about

**Rationale:** Layered schemas mirror the OPSP-over-OPSX architecture. Each layer is independently valid. A project can start with spec-driven and upgrade to sprint-driven without breaking anything.

### Decision: Schema extends resolution in artifact-graph
**Choice:** Modify `artifact-graph/resolver.ts` to support the `extends` field. When loading a schema, if `extends` is present, first load the parent schema's artifacts, then merge child artifacts. Child artifacts can depend on parent artifacts but not vice versa.

**Alternatives considered:**
- **Pre-merge at build time** — rejected: loses the layered separation, makes it hard to reason about which artifacts come from which layer
- **Plugin system** — rejected: overengineered for the current need of exactly two layers

**Rationale:** Runtime resolution keeps the schemas physically separate while allowing composition. The artifact graph already handles dependencies; this just widens the graph.

### Decision: OPSP artifacts write to `opensprint/` not `openspec/`
**Choice:** Driver specs, decisions, and the decision map live in `opensprint/` at project root, completely separate from `openspec/`.

**Alternatives considered:**
- **Nested under openspec/ (e.g., `openspec/opensprint/`)** — rejected: blurs the durability boundary, `rm -rf openspec/` would destroy durable artifacts
- **Same directory with naming conventions** — rejected: no physical separation, human error risk during rebuild

**Rationale:** The directory boundary is the rebuild contract. Physical separation makes the durability hierarchy visible in the file tree. An operator (or script) can confidently delete everything except `opensprint/` when rebuilding.

### Decision: Decision map is agent-maintained, not a schema artifact with instructions
**Choice:** `DECISION-MAP.md` is regenerated programmatically by reading all decision records and computing the tree, rather than being created through the instruction-serving flow like other artifacts.

**Alternatives considered:**
- **Treat as a normal artifact with instructions** — rejected: the map is computed, not authored. Serving instructions to an LLM to "create" it introduces unnecessary variability.
- **Store tree data in a JSON/YAML file** — rejected: loses human readability. The map should be scannable by both humans and agents.

**Rationale:** The map is a projection of the decisions directory, similar to how a database index is a projection of the data. It should be deterministic and consistent, which means programmatic generation.

### Decision: OPSP skills as new workflow templates alongside OPSX
**Choice:** Add new workflow template files in `src/core/templates/workflows/` for each OPSP command (`driver.ts`, `decide.ts`, `tree.ts`, `rebuild-assess.ts`). Register them in the skill-templates barrel export. Add them to the command-generation pipeline gated on `sprint-driven` schema.

**Alternatives considered:**
- **Separate template directory for OPSP** — rejected: the command-generation pipeline already handles workflow templates uniformly. Adding a separate directory would require duplicating the generation logic.
- **Embed OPSP skills as extensions of OPSX skills** — rejected: OPSP skills have different concerns (artifact management vs change management). Mixing them would make both harder to maintain.

**Rationale:** Follows existing patterns. Each OPSP skill is a self-contained workflow template, generated through the same adapter pipeline as OPSX skills.

### Decision: Four foundational OPSP commands for initial release
**Choice:** Start with `/opsp:driver`, `/opsp:decide`, `/opsp:tree`, `/opsp:rebuild:assess`. Defer `/opsp:explore` (OPSP-aware), `/opsp:propose` (initiative-level), and orchestration commands.

**Alternatives considered:**
- **Ship all OPSP commands at once** — rejected: the orchestration commands depend on having real usage data from the foundational ones
- **Start with only driver + decide** — rejected: tree and rebuild:assess are what make the decision layer useful, not just documented

**Rationale:** These four commands complete the OPSP artifact management loop: create driver specs, record decisions, visualize the tree, assess rebuild impact. This is the minimum viable OPSP that proves the "scrap and rebuild" thesis.

## Risks / Trade-offs

- **[Schema extends complexity]** → The `extends` mechanism adds a new concept to schema resolution. Mitigation: keep it simple (single-level extends only, no deep inheritance chains). Document the constraint explicitly.

- **[Decision map staleness]** → If the map isn't regenerated after every decision change, it falls out of sync. Mitigation: regeneration is triggered by the decide/supersede skills, not left to manual invocation. Include a validation check.

- **[OPSP skill discoverability]** → Users accustomed to OPSX may not know OPSP commands exist. Mitigation: `init` with sprint-driven schema generates both OPSX and OPSP skills. The onboard skill can be updated to introduce OPSP concepts.

- **[Blast radius calculation correctness]** → Transitive dependency counting could have edge cases with superseded decisions. Mitigation: only count `active`/`accepted` decisions. Add test cases for supersession chains.

## Open Questions

- Should the `sprint-driven` schema be selectable during `init` as a schema option, or should it be activated separately (e.g., `opensprint init`)?
- What is the maximum practical depth for a decision tree before it becomes unmanageable? Should the system warn at some threshold?
