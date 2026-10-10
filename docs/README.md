# OpenSprint documentation

OpenSprint is an engineering harness for sprint and milestone orchestration, where the
participants may be human, agent, or both.

| Page | Read it when |
|---|---|
| [Installation](installation.md) | setting the tool up in a repository |
| [Concepts](concepts.md) | you want to know what a driver-spec, a hat or an attestation actually is |
| [Workflows](workflows.md) | you want the command reference and the order things run in |
| [Git workflow](git-workflow.md) | deciding how OpenSprint should fit your branching and CI |

Two more documents live at the repository root:

- [`OPENSPRINT-GUIDE.md`](../OPENSPRINT-GUIDE.md) — a worked walkthrough, greenfield and brownfield
- [`PHILOSOPHY.md`](../PHILOSOPHY.md) — why the tool is shaped this way

## The shortest possible summary

A team records **constraints** (driver-specs) and the **decisions** that answer them (ADRs). Those
are the source of truth. Everything else — the per-hat views, `architecture.md`, the board — is
**compiled from them** and fails the build when it drifts.

Work runs as **initiatives**, each a branch, each made of **milestones** that are ordinary change
cycles. An initiative sets a **bar** when it is proposed and comes back to **attest** it before it
merges, which is the part most processes leave out.
