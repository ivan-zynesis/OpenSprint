## Context

OpenSprint v0.0.1 shipped the OPSP artifact infrastructure: sprint-driven schema extending spec-driven, `opensprint/` directory with driver-specs and decisions, decision-map generator, and 4 utility commands. What's missing is the orchestration lifecycle — the commands operators actually invoke to run initiatives end-to-end.

The key insight driving this design: OPSP artifacts collectively form an **operator surrogate**. Every time the operator answers a question, the answer gets encoded into driver-specs, ADRs, or architecture.md. Over time, the surrogate resolves more questions autonomously, reducing operator interruptions. The lifecycle commands are the mechanism through which this surrogate is built and used.

## Goals / Non-Goals

**Goals:**
- Implement 4 lifecycle skill templates: `/opsp:explore`, `/opsp:propose`, `/opsp:apply`, `/opsp:archive`
- Introduce `architecture.md` as the compiled architectural state document
- Introduce `initiatives/<name>.md` as lightweight initiative descriptors
- Rename `decisions/` → `ADRs/` across all code, templates, tests, and skill instructions
- Register all 8 OPSP commands (4 lifecycle + 4 utilities) in the generation pipeline

**Non-Goals:**
- Automated opsx cycle invocation (the `/opsp:apply` skill template describes the orchestration, but the agent executes it — we're not building a programmatic opsx runner)
- Multi-agent coordination (squad leads are a future persona, not implemented here)
- Version history for architecture.md (it's rewritten; ADRs preserve the trail)

## Decisions

### Decision: Lifecycle commands are skill templates, not programmatic orchestrators
**Choice:** The 4 lifecycle commands are implemented as skill template markdown instructions (like all existing opsx/opsp commands), not as TypeScript code that programmatically invokes opsx commands.

**Alternatives considered:**
- **Programmatic orchestrator in TypeScript** — rejected: the agent (Claude, Cursor, etc.) is the orchestrator. The skill template tells it what to do. Adding a TypeScript runner would duplicate agent capability and create a rigid pipeline.
- **Hybrid: template + CLI helper commands** — rejected: premature. Start with pure skill templates. If operators need CLI helpers (e.g., `opensprint apply --initiative`), add them when real usage patterns emerge.

**Rationale:** OpenSprint's philosophy is "the agent handles actual development." The skill templates are the instructions. The agent is the executor. This keeps the system flexible — different agents can interpret the instructions differently, and operators can intervene at any point.

### Decision: architecture.md is a single rewritable file, not versioned
**Choice:** `opensprint/architecture.md` gets rewritten on each `/opsp:archive`. ADRs serve as the version history.

**Alternatives considered:**
- **Append-only architecture log** — rejected: becomes unwieldy. The point is "current state, one file."
- **Versioned (architecture-v1.md, v2.md)** — rejected: git history serves this purpose already. ADRs capture the reasoning trail.

**Rationale:** architecture.md answers "what is the system NOW." ADRs answer "how did we get here." No need to duplicate the trail in architecture.md itself.

### Decision: Rename decisions/ → ADRs/ to enforce two-tier decision model
**Choice:** The directory is called `ADRs/` (Architecture Decision Records) to make explicit that only architect-level decisions live here.

**Alternatives considered:**
- **Keep decisions/ with a metadata flag for tier** — rejected: naming matters. "decisions" implies all decisions. "ADRs" implies architectural significance.
- **architect-decisions/** — rejected: too long. ADR is an established industry term.

**Rationale:** Squad-level decisions (made within opsx) are implementation byproducts — they don't get recorded as opensprint artifacts. Only decisions that cross the escalation threshold become ADRs. The name enforces this.

### Decision: /opsp:apply describes orchestration via skill instructions, agent executes opsx commands inline
**Choice:** The `/opsp:apply` skill template instructs the agent to read the initiative plan, then for each planned change, execute the opsx workflow (explore → propose → apply → archive) inline within the same conversation. The agent uses its existing opsx skill knowledge.

**Alternatives considered:**
- **Spawn sub-agents per opsx cycle** — rejected: current AI tool environments don't reliably support nested agent invocation. The agent handles it sequentially.
- **Create all opsx changes upfront, then apply them** — rejected: loses the iterative learning. Each opsx cycle's outcome should inform the next one.

**Rationale:** Sequential execution with surrogate learning between cycles is the natural flow. The architect agent carries context across all opsx cycles within the same initiative.

### Decision: Surrogate resolution is instruction-based, not programmatic
**Choice:** The `/opsp:apply` skill template instructs the agent to "check driver-specs, ADRs, and architecture.md before asking the operator." This is an instruction to the agent, not a programmatic lookup.

**Alternatives considered:**
- **Programmatic RAG over opensprint/ artifacts** — rejected: overengineered for v0.0.2. The agent can read files directly. RAG would be useful at scale (hundreds of ADRs) but is premature now.

**Rationale:** The agent reads the files and reasons about them. This is what LLMs are good at. If surrogate resolution needs optimization later, we can add indexing.

## Risks / Trade-offs

- **[Skill template length]** → The `/opsp:apply` skill template will be long and complex (orchestrating multiple opsx cycles). Mitigation: structure it clearly with phases and decision points. Test with real initiatives.

- **[Agent context limits]** → Running multiple opsx cycles within one conversation may hit context limits. Mitigation: the skill template should instruct the agent to summarize completed cycles and drop implementation detail before starting the next one.

- **[Rename `decisions/` → `ADRs/` is breaking]** → Projects using v0.0.1 with `decisions/` will need migration. Mitigation: v0.0.1 just shipped and likely has zero external users yet. If needed, add a migration check in init that renames the directory.

- **[architecture.md quality]** → The compiled document is only as good as the agent's synthesis. Mitigation: provide a clear template with sections. The operator can always review and edit.

## Open Questions

- Should `/opsp:propose` automatically run opsx:explore and opsx:propose for the first milestone, or just produce the initiative plan and let `/opsp:apply` handle all opsx cycles?
