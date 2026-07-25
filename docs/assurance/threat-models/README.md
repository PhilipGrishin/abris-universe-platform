# Threat Model Index

| Field | Value |
| --- | --- |
| Document ID | AU-THREAT-INDEX-001 |
| Title | Threat Model Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Security Reviewer | AU-AGENT-003 |
| Version | 1.6.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/RISKS.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Trust boundary or data-flow change; new integration; security incident; control change |

## Purpose

Index proposed and approved threat models and their security review status.

## Scope

This index contains task-scoped threat models grounded in approved requirements
and proposed technical data flows. A proposed threat model does not prove that
its controls are implemented or tested.

## Current Threat Models

| Task | Threat model | Status | Security review |
| --- | --- | --- | --- |
| TASK-THINSLICE-001 | [Phase 0 Threat Model](TASK-THINSLICE-001_THREAT_MODEL.md) | `[PROPOSED]`; architecture review `ACCEPTED_WITH_GATES` | AU-AGENT-003 design review `VERIFIED WITH FINDINGS`; runtime evidence `[OPEN]` |

## Owner

AU-AGENT-002 maintains the index and lifecycle. AU-AGENT-001 and assigned
technical owners approve model meaning and controls. AU-AGENT-003 independently
reviews security evidence and findings without redesigning architecture or
implementing controls. AU-AGENT-005 owns backend, data, API, authentication,
storage, synchronization, backup, and recovery threat-model inputs and
implementation evidence in its domain. AU-AGENT-006 owns client-side threat
inputs and implementation evidence for public API consumption, authentication
integration, local storage and cache, offline behavior, and client platform
boundaries without redefining backend controls.

## Lifecycle

Threat models are reviewed when their declared assets, boundaries, flows,
dependencies, threats, or mitigations change. Historical models remain linked
when superseded.

## Adding Threat Models

Provide scope, source architecture, assets, actors, trust boundaries, data
flows, threats, controls, residual risks, evidence, owner, approver, traceability,
and Documentation Impact.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Assurance Index](../README.md)
- [Risks](../../RISKS.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
