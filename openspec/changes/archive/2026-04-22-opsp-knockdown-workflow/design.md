## Context

OpenSprint's surrogate (architecture.md, ADRs, driver-specs) is the agent's "brain" for a project. On greenfield projects, the surrogate grows naturally through `/opsp:explore` and `/opsp:propose`. But brownfield projects have no surrogate — and the knowledge is buried in code, configs, and implicit decisions. The operator needs a way to bootstrap the surrogate from what already exists.

This is fundamentally **reverse system design** — the inverse of the standard process (requirements → architecture → tech stack → implementation). Knockdown goes: implementation → tech stack → architecture → requirements (driver-specs).

## Goals / Non-Goals

**Goals:**
- Systematically extract architecture.md, ADRs, and driver-specs from an existing codebase
- Use progressive compaction to handle codebases of any size without hitting context limits
- Provide pause/resume capability via working data artifacts
- Be language, framework, and platform agnostic
- Produce the same surrogate artifacts regardless of how well-documented the codebase is
- Interactive operator confirmation for ADRs and driver-specs (high-confidence surrogate)

**Non-Goals:**
- Modifying the codebase (knockdown is read-only)
- Understanding business logic at function level (only architectural significance)
- Replacing existing documentation (knockdown supplements, doesn't overwrite)
- Being fully automated (operator confirmation is required for surrogate quality)

## Decisions

### D1: Progressive compaction over single-pass analysis

**Choice**: Knockdown processes the codebase bottom-up through file scan → compaction → extraction phases, progressively reducing detail while preserving architectural signal. Working data is persisted in `opensprint/knockdown/` for pause/resume.

**Rationale**: Large codebases can't fit in a single context window. Progressive compaction naturally handles any size — each compaction round reduces the information volume while preserving what matters architecturally. The working data artifacts make the process resumable across sessions.

**Alternatives considered**:
- Single-pass "read everything" — fails on large codebases, no pause/resume
- Sampling (read representative files) — misses architectural details in unexpected places

### D2: Three-question classifier for every summary

**Choice**: Every file or compacted summary gets asked three questions in order:
1. "Is this a driver-spec?" (external constraint, requirement) → Extract, terminal
2. "Is this an ADR?" (significant architectural decision with rationale) → Extract, terminal
3. "Will this affect an ADR?" (implementation detail that traces to a decision) → Keep for compaction
4. None of the above → Drop (no architectural signal)

**Rationale**: This classifier is simple, deterministic, and naturally produces the right surrogate artifacts. It ensures every piece of code is evaluated for architectural significance, and that the compaction pipeline only carries forward what matters.

### D3: Filename-first inference, content-read only when ambiguous

**Choice**: Phase 2 attempts to infer a file's summary from its name and path before reading its content. Content is read only when the filename is ambiguous (e.g., `utils.ts`, `index.ts`, `main.py`).

**Rationale**: File and directory names are the developer's primary organizational signal. Well-named files (`jwt-strategy.ts`, `docker-compose.yml`, `prisma.schema`) convey their purpose without reading content. This dramatically reduces the number of file reads needed, especially in large codebases. Poor naming is handled gracefully — the agent falls back to reading content.

### D4: Pragmatic compaction — don't force unrelated merges

**Choice**: During bottom-up compaction, only merge summaries that share architectural context. Unrelated summaries float up to the next level unchanged until they find related siblings or get classified.

**Rationale**: Forced merges (e.g., "auth + payments + email = application layer") lose architectural signal. The agent should recognize when summaries are unrelated and keep them separate. This mirrors how a human architect would describe the system — by domain, not by directory proximity.

### D5: Architecture template as extraction harness

**Choice**: Phase 4 uses a structured architecture.md template (System Identity, System Boundary, Component Map, Cross-Cutting Concerns, Infrastructure Topology, Constraints) as a harness for the extraction. The template guides what to extract, not how to write it.

**Rationale**: Without structure, the agent would produce inconsistent architecture documents. The template ensures every knockdown produces a comparable, complete architecture.md regardless of the codebase type.

### D6: Operator warning about model requirements

**Choice**: Before starting the knockdown process, warn the operator to use an advanced model with extended thinking enabled and the largest available context window.

**Rationale**: Knockdown is the most cognitively demanding OpenSprint skill — it requires deep reasoning about code structure, architectural patterns, and decision significance. A smaller model or limited context window will produce a lower-quality surrogate. The warning sets expectations upfront.

## Risks / Trade-offs

**[Risk] Agent misclassifies a file as "drop" when it contains architectural signal** → Mitigation: The architecture probe checklist in Phase 4 acts as a safety net — if the extraction finds gaps, the agent can revisit dropped files in specific areas.

**[Risk] Compaction loses nuance in large directories with many files** → Mitigation: Pragmatic compaction preserves unrelated summaries rather than forcing merges. The toc.yaml tracks every file's status, so nothing is silently lost.

**[Risk] Operator fatigue during interactive confirmation of many ADRs** → Mitigation: ADRs are batched by area (auth, data, infra) and presented as a group. Operator can confirm a batch, not individual items.

**[Trade-off] Working data in opensprint/knockdown/ adds to project files** → Acceptable because: it's in the opensprint/ directory (already gitignored by many teams), and it enables the critical pause/resume capability.

**[Trade-off] Filename inference may miss poorly-named files** → Acceptable because: the agent falls back to reading content when uncertain. And poorly-named files in a brownfield project are a known reality — the compaction pipeline handles them by reading and classifying.
