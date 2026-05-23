# Proposal: Define Reconciliation Schemas

## Parent Initiative
parallel-universe-reconciliation

## Driver Specs
- DS-PARALLEL-EXEC: parallel initiatives require a reconciliation protocol
- DS-HIGH-IMPACT-OPS: reconciliation ops are high-impact and require audit trails

## ADRs Referenced
- DEC-002: conflict resolution policy (MIGRATE/CONFLICT/REDUNDANT/SUPERSEDED taxonomy)
- DEC-003: DFS traversal order (initiative → ADRs → changes)
- DEC-005: abandoned universe archive structure

## Summary

Define the data schemas and specifications that underpin both `/opsp:rebase` and `/opsp:abandon` workflows. These schemas are the shared vocabulary — without them, the two skill implementations would have no common ground for expressing citizen classifications, conflict manifests, and migration records.

## What's Included

1. **Citizen taxonomy spec** — formal definition of MIGRATE/CONFLICT/REDUNDANT/SUPERSEDED with classification criteria
2. **Conflict manifest spec** — schema for the read-only planning phase output (produced before any writes)
3. **Migration manifest spec** — schema for the `opensprint/abandoned/{name}/migration-manifest.md` produced by `/opsp:abandon`

## Out of Scope

Skill implementations (handled in subsequent milestones). These specs are reference documents only.
