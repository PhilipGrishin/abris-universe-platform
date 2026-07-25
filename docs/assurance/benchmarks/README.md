# Benchmark Documentation Index

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-INDEX-001 |
| Title | Benchmark Documentation Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.5.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Target, method, environment, dataset, implementation, or result change |

## Purpose

Index reproducible benchmark definitions, baselines, results, and limitations.

## Scope

This index distinguishes benchmark plans from measured results. A proposed plan
may define reproducible targets and methods but creates no performance claim.

## Current Benchmarks

| Task | Record | Status | Result |
| --- | --- | --- | --- |
| TASK-THINSLICE-001 | [Phase 0 Benchmark Plan](TASK-THINSLICE-001_BENCHMARK_PLAN.md) | `[PROPOSED]`; architecture review `ACCEPTED_WITH_GATES` | No implementation result |

## Owner

AU-AGENT-002 maintains indexing, metadata, references, traceability, and result
lifecycle. AU-AGENT-004 owns pattern-processing benchmark method and technical
meaning; AU-AGENT-005 owns backend, database, storage, API, and synchronization
benchmark method and technical meaning; AU-AGENT-006 owns client, UI,
responsiveness, rendering-integration, offline, and supported-platform
performance benchmark method and technical meaning; AU-AGENT-003 independently
reviews evidence and conclusions.

## Lifecycle

Benchmarks must preserve method, environment, dataset, version, baseline,
results, acceptable degradation, and limitations. Stale results remain
historical and are not labeled current.

## Adding Benchmarks

Provide Task ID, target source, method, environment, dataset, implementation
version, baseline, result, variance, limitations, evidence, owner, approver,
traceability, and Documentation Impact.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Assurance Index](../README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
