# Installation

## Requirements

- **Node.js 20.19.0 or newer** — check with `node --version`
- **git** — OpenSprint manages initiative and change branches as worktrees

## Install

```bash
npm install -g @ivan-lee/opensprint
```

<details>
<summary>pnpm, yarn, bun</summary>

```bash
pnpm add -g @ivan-lee/opensprint
yarn global add @ivan-lee/opensprint
bun add -g @ivan-lee/opensprint
```
</details>

The binary is **`opensprint`**. The npm scope is `@ivan-lee`; the GitHub organisation is
`ivan-zynesis`. They differ — install from the scope, not the organisation name.

Or run it without installing:

```bash
npx @ivan-lee/opensprint init
```

## Set up a repository

```bash
cd your-project
opensprint init
```

`init` asks which AI tools you use and writes agent instructions for each. It creates:

```
openspec/
  config.yaml          schema, tech-stack context, rules
  specs/               source-of-truth specifications
  changes/             active change proposals, and archive/

opensprint/
  driver-specs/        constraints — the external truth
  ADRs/                decisions, each tracing to the constraint it answers
  initiatives/         work, as containers that fill over time
  DECISION-MAP.md      the decision tree, generated
  BOARD.md             every initiative by state, generated
  squad/               one compiled view per hat
  architecture.md      the whole system, compiled

.claude/skills/…       agent skills, per tool you selected
.claude/commands/…     slash commands, per tool you selected
```

### Already have a codebase?

Run the reverse-engineering pass before anything else. It reads the code and infers a surrogate
from it:

```
/opsp:knockdown
```

What it produces is **observed**, not decided — it is an account of what the code does, not of what
anyone chose. Treat it as a draft to correct, and see [Concepts](concepts.md#three-authorities) for
why that distinction is load-bearing.

## Supported tools

`init` detects what a repository already uses and offers the rest. Agent instructions are generated
for 29 tools, including:

```
claude · cursor · windsurf · codex · gemini · github-copilot · cline · roocode
kilocode · continue · amazon-q · junie · kiro · opencode · qwen · trae · crush
factory · auggie · antigravity · pi · qoder · lingma · iflow · costrict
codebuddy · forgecode · bob · agents
```

`agents` writes a tool-agnostic `AGENTS.md`, which anything that reads that convention will pick up.

Each tool gets skills, slash commands, or both — set with:

```bash
opensprint config
```

## Verify

```bash
opensprint --version
opensprint compact check     # exits non-zero if any compiled view has drifted
opensprint compact loops     # reports gaps in the record: unanswered, unguarded, unattested
```

On a fresh repository both are quiet. They become useful once there are records to check.

## Updating

```bash
npm install -g @ivan-lee/opensprint@latest
opensprint update
```

`update` refreshes generated agent instructions in place. It does not touch your records: anything
under `opensprint/` or `openspec/specs/` is yours.

Compatibility is **best-effort**, scoped to one surface — a new release meeting a project whose
directories were written by an older version. New fields on a record are optional; removing or
renaming one is a breaking change under semver.
