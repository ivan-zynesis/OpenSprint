# Reconciliation Citizen Taxonomy Specification

## Purpose

Define the classification vocabulary used by `/opsp:rebase` and `/opsp:abandon` when evaluating surrogate artifacts (citizens) from a source universe for migration into a target universe.

## Definitions

### Citizen

A **citizen** is any surrogate artifact eligible for reconciliation evaluation:

- Driver-specs: `opensprint/driver-specs/*.md`
- ADRs: `opensprint/ADRs/*.md`
- Initiative descriptors: `opensprint/initiatives/*.md`
- Active opsx changes: `openspec/changes/*/` (excluding `archive/`)

### Classification

Each citizen receives exactly one classification per reconciliation run:

#### MIGRATE
**Criteria**: Present in source universe, absent in target universe, with no semantic conflict detectable against existing target citizens.

**Confidence levels**:
- **HIGH**: Purely additive — the citizen introduces content with no overlap with any existing target citizen. The agent may auto-accept without operator confirmation.
- **LOW**: Content overlaps with existing target content but no direct contradiction is detected. The agent MUST escalate to the operator.

**Rule**: Only HIGH-confidence MIGRATE citizens are auto-accepted. LOW-confidence always escalates. When in doubt, assign LOW.

#### CONFLICT
**Criteria**: Present in both source and target universes, and the content is semantically incompatible or directly contradictory.

**Rule**: Always escalates to the operator. The agent presents both versions and explains the contradiction. The operator decides which version stands, or provides a merged resolution.

#### REDUNDANT
**Criteria**: Present in both source and target universes, and the content is semantically equivalent (may differ in wording but not in meaning or implication).

**Rule**: Skip — no write occurs. The existing target citizen is preserved as-is.

#### SUPERSEDED
**Criteria**: Present in source universe, and the target universe has already resolved this concern differently through a different citizen or decision.

**Rule**: Drop from migration. Record in manifest with a reference to what superseded it in the target.

---

## DFS Traversal Order

Citizens are evaluated depth-first, with the **initiative as the unit of commitment**:

```
for each initiative in source universe:
  for each ADR referenced by or created during this initiative:
    classify citizen
    if CONFLICT or LOW-confidence MIGRATE → escalate, await operator
  for each active opsx change belonging to this initiative:
    classify citizen
    if CONFLICT or LOW-confidence MIGRATE → escalate, await operator
  → commit or skip the initiative as a whole
proceed to next initiative
```

**Pause semantics**: If any inner citizen produces an unresolved conflict (operator has not yet decided), the entire initiative pauses. The DFS does not advance to the next initiative until the current one is resolved or explicitly skipped by the operator.

---

## Agent Confidence Guardrail

The agent MUST default to LOW confidence when uncertain. The cost of a false escalation is one operator confirmation. The cost of a false auto-accept is a corrupted surrogate with unbounded downstream blast radius.

> **Bias toward escalation. Express uncertainty liberally.**

Conditions for HIGH confidence (all must hold):
1. The citizen ID does not exist in the target universe
2. The citizen content references no concepts, IDs, or decisions that exist in the target universe
3. The citizen does not contradict any existing target ADR or driver-spec (even implicitly)
