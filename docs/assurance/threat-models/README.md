# Threat Model Index

| Field | Value |
| --- | --- |
| Document ID | AU-THREAT-INDEX-001 |
| Title | Threat Model Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 until a registered security owner exists |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/RISKS.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Trust boundary or data-flow change; new integration; security incident; control change |

## Purpose

Index approved threat models and their security review status.

## Scope

No threat model exists yet. This index does not invent trust boundaries,
controls, assets, actors, or threats.

## Current Threat Models

None. Creation requires an approved task, confirmed architecture/data flow, and
an assigned security reviewer.

## Owner

AU-AGENT-002 maintains the index and lifecycle. The assigned security and
technical owners approve model meaning and controls.

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
