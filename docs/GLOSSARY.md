# Engineering Glossary

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-GLOSSARY-001 |
| Title | Engineering Glossary |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.2.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/standards/DOCUMENTATION_STANDARD.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Approved term change; new canonical term; terminology conflict; source supersession |

## Purpose

Provide one navigable registry of approved engineering and documentation terms
without replacing their canonical definitions.

## Scope

The initial scope contains organizational and documentation-governance terms.
Product and domain terms are added only from an approved product, architecture,
ADR, or specification source.

## Terms

### Architecture Decision Record (ADR)

A durable record of an approved consequential technical decision, its context,
alternatives, consequences, risks, migration, and rollback. Canonical decisions
are indexed under `docs/architecture/adr/` and summarized by
`docs/DECISIONS.md`.

### Canonical Source

The registered authoritative location for a knowledge class. Authority is
defined by `docs/SOURCE_OF_TRUTH.md`.

### Documentation Impact

The required task classification `None`, `Minor`, `Material`, or `Breaking`, as
defined by `docs/standards/DOCUMENTATION_STANDARD.md`.

### Documentation Review Report

A structured report describing documentation defects, evidence, affected
sources, owners, remediation, and status. It does not change technical meaning
without content-owner approval.

### Engineering Handbook

An explanatory and navigational layer built only from approved engineering
knowledge. It links to canonical ADRs, RFCs, specifications, architecture, and
standards instead of duplicating their technical facts.

### Engineering Verification Status

The task-scoped quality-gate decision assigned by AU-AGENT-003 after independent
engineering review. Allowed values are `VERIFIED`, `VERIFIED WITH FINDINGS`,
`REWORK REQUIRED`, and `BLOCKED`. These values are written without project
status brackets and do not assign `[VERIFIED]` product acceptance, which remains
with Claude Cowork.

### Owner

The role accountable for maintaining a document or decision through its
lifecycle. Ownership of documentation structure does not imply ownership of
technical or product meaning.

### Product Contour

The repository area under `product/` containing product meaning, decisions,
Task Packages, Claude Cowork roles, research, and independent acceptance. Its
authority is separate from the Codex engineering contour.

### Engineering Contour

The repository areas governed by `AGENTS.md`, `.codex/`, and `docs/`, plus
future implementation sources. It owns technical decisions and evidence within
approved product constraints, not product meaning.

### Request for Comments (RFC)

A reviewable proposal for a potentially cross-cutting engineering change. An RFC
is not an approved decision unless its disposition and required ADR evidence say
so.

### Source of Truth

The highest-authority applicable source for a fact or rule, resolved using the
hierarchy in `docs/SOURCE_OF_TRUTH.md`.

### Supersession

An explicit lifecycle relationship in which a newer document replaces all or a
defined part of an older document without silently deleting history.

### Technical Approver

The role authorized to confirm technical meaning. AU-AGENT-002 may be a document
owner but cannot approve architecture or product meaning outside its authority.

### Traceability Matrix

A mapping among requirements, decisions, implementation evidence, tests,
documentation, and acceptance. It is an index of relationships, not a source of
meaning.

## Owner

AU-AGENT-002 maintains term structure, references, duplicates, and consistency.
The relevant product or technical owner approves each term's meaning.

## Lifecycle

Add or revise a term only when an approved source introduces or changes it.
Superseded terms remain traceable and point to the replacement term.

## Adding Terms

Provide the proposed term, canonical source, owner, definition or reference,
aliases, deprecated forms, affected documents, and approval. Reject duplicate
definitions and unresolved terminology conflicts.

## Related Sources

- `docs/SOURCE_OF_TRUTH.md`
- `docs/standards/DOCUMENTATION_STANDARD.md`
- `docs/TRACEABILITY_MATRIX.md`
