# Product Architecture Inputs

| Field | Value |
| --- | --- |
| Document ID | AU-PROD-ARCHINPUT-INDEX-001 |
| Title | Product Architecture Inputs |
| Status | `[IMPLEMENTED]` |
| Owner | System Architecture, Data & AI Governance Lead |
| Technical Approver | Project Owner |
| Version | 1.2.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `product/README.md`, `docs/SOURCE_OF_TRUTH.md`, `docs/ARCHITECTURE.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Product architecture constraint change; Codex Technical Review; ADR disposition |

## Purpose and Scope

Index product-side architecture constraints and recommendations supplied to
engineering. This directory is not the canonical engineering architecture and
cannot approve a technology stack, database, cloud provider, or deployment
topology.

## Registered Input

- [Architecture, Data, Scalability, and Recommended Stack](02_Architecture_and_Stack.md)
  — `[APPROVED]` product-side architecture input under PROD-DEC-005; stack
  recommendations and proposed ADRs still require Codex Technical Review and
  the engineering decision process. Section 9.5 contains the wording-only
  `SXP` to `XSP` correction authorized by PROD-DEC-009.

## Owner, Lifecycle, and Additions

Product-side owners approve required outcomes and constraints. AU-AGENT-001 and
engineering ADR approvers own technical decisions. Add inputs with source,
status, constraint versus recommendation labeling, affected Task Packages, and
review route.

## Related Sources

- `docs/ARCHITECTURE.md`
- `docs/architecture/adr/README.md`
- `docs/SOURCE_OF_TRUTH.md`
