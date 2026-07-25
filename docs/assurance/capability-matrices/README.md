# Capability Matrix Index

| Field | Value |
| --- | --- |
| Document ID | AU-CAP-INDEX-001 |
| Title | Capability Matrix Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.4.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Supported capability, limitation, platform, format, or evidence changes |

## Purpose

Index evidence-backed capability matrices and explicit limitations.

## Scope

No capability is declared by this index. Capability claims require defined
scope, version, evidence, and an assigned technical approver.

## Current Matrices

- [OXS Coordinate Compatibility Matrix](../../../tests/fixtures/oxs/COMPATIBILITY_MATRIX.md)
  — `[TESTED]` for `Abris Universe Route-1 Fixture Generator 1.0.0`; all other
  producer profiles remain explicitly open. The bounded importer core enforces
  this matrix by rejecting unregistered profiles.
- [OXS Route-1 Symbol Mapping Evidence](../../../tests/fixtures/oxs/SYMBOL_MAPPING.md)
  — `[TESTED]` for project-original literal `A`–`Z` and `a`–`f` route-1 source
  codes; no general producer exact-symbol claim.

## Owner

AU-AGENT-002 maintains indexing, terminology, references, traceability, and
lifecycle. AU-AGENT-004 owns pattern supported-format and compatibility matrix
meaning; AU-AGENT-006 owns supported mobile/web platform, viewport,
accessibility, offline-client, and client integration matrix meaning;
AU-AGENT-003 independently reviews the supporting evidence.

## Lifecycle

Update matrices with capability, format, platform, implementation, test, or
limitation changes. Never preserve a stale support claim as current.

## Adding Matrices

Provide capability dimensions, supported and unsupported states, versions,
limitations, evidence, owner, approver, review triggers, traceability, and
Documentation Impact.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Assurance Index](../README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
