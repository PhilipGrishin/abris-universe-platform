# Engineering Handbook Index

| Field | Value |
| --- | --- |
| Document ID | AU-HB-INDEX-001 |
| Title | Engineering Handbook Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/standards/DOCUMENTATION_STANDARD.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Approved chapter added or superseded; navigation change; canonical source change; glossary change |

## Purpose

Maintain navigation, chapter status, and release readiness for the future Abris
Universe Engineering Handbook.

## Scope

This directory is infrastructure only. No Handbook chapter content has been
created. Future chapters may explain architecture, principles, domain models,
constraints, standards, and implementation expectations only from approved
engineering sources.

## Authority Boundary

The Handbook is not a parallel source of truth. It must not duplicate ADRs,
RFCs, specifications, architecture documents, or product decisions. It explains
the system, connects canonical sources, and uses references instead of
redefining technical facts.

External Architecture AI output is draft input. It requires technical-owner
approval before AU-AGENT-002 integrates it into navigation, glossary,
traceability, and a documentation release.

## Chapter Requirements

Every chapter must contain:

- Purpose
- Scope
- Definitions
- Engineering Principles
- Architecture
- Constraints
- Common Mistakes
- Review Checklist
- References

Use [CHAPTER_TEMPLATE.md](CHAPTER_TEMPLATE.md) for future approved work.

## Current Chapters

None. Chapter creation is intentionally deferred until approved engineering
knowledge and an explicit chapter task exist.

## Owner

AU-AGENT-002 owns Handbook structure, navigation, references, releases,
consistency, and lifecycle. AU-AGENT-001 and relevant domain agents own and
approve technical meaning.

## Lifecycle

Chapters move through draft, content review, documentation review, approval, and
explicit supersession. A chapter is listed here only after its canonical sources
and approvers are known.

## Adding Chapters

Provide a versioned task, Documentation Impact, canonical source list, content
owner, technical approver, glossary and traceability impact, review checklist,
and intended Handbook release. Do not create a chapter to fill an empty slot.

## Related Sources

- [Source of Truth Registry](../SOURCE_OF_TRUTH.md)
- [Documentation Standard](../standards/DOCUMENTATION_STANDARD.md)
- [Engineering Glossary](../GLOSSARY.md)
- [Traceability Matrix](../TRACEABILITY_MATRIX.md)
