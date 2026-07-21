# Engineering Documentation Home

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-INDEX-001 |
| Title | Engineering Documentation Home |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.1.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `collaboration/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Documentation structure change; new document class; broken navigation; source hierarchy change |

## Purpose

Provide the human- and AI-readable entry point to Abris Universe engineering
knowledge without duplicating the content of canonical sources.

## Scope

This index covers governance, current state, architecture, decisions,
specifications, standards, assurance evidence, the Engineering Handbook,
traceability, terminology, and documentation reviews.

## Start Here

1. Read the [Platform Manifest](../PROJECT_MANIFEST.md).
2. Read the [Source of Truth Registry](SOURCE_OF_TRUTH.md).
3. Select the [Product Contour](../product/README.md) or engineering sources
   indexed here.
4. Follow the project [Session Bootstrap](../.codex/SESSION_BOOTSTRAP.md).
5. Read [Project Context](PROJECT_CONTEXT.md) and
   [Current Status](CURRENT_STATUS.md).
6. Check [Current Focus](../.codex/CURRENT_FOCUS.md), [Tasks](TASKS.md), and
   [Open Questions](OPEN_QUESTIONS.md).
7. Use the indexes below for the relevant engineering knowledge class.

## Canonical Navigation

- [Source of Truth Registry](SOURCE_OF_TRUTH.md)
- [Documentation Standard](standards/DOCUMENTATION_STANDARD.md)
- [Engineering Glossary](GLOSSARY.md)
- [Traceability Matrix](TRACEABILITY_MATRIX.md)
- [Engineering Handbook](handbook/README.md)
- [Architecture Index](architecture/README.md)
- [ADR Library](architecture/adr/README.md)
- [RFC Library](architecture/rfc/README.md)
- [Specifications](specifications/README.md)
- [Engineering Standards](standards/README.md)
- [Engineering Assurance](assurance/README.md)
- [Documentation Reviews](reviews/documentation/README.md)
- [Shared Product-to-Engineering Workflow](SHARED_WORKFLOW.md)
- [Shared AI Organization](../AI_ORGANIZATION.md)
- [Product Contour](../product/README.md)
- [GitHub Collaboration Recommendations](GITHUB_COLLABORATION_RECOMMENDATIONS.md)
- [Local Claude-Codex Collaboration Bridge](../collaboration/README.md)

## Existing Project Records

- [Architecture Overview](ARCHITECTURE.md)
- [Agent Organization](CODEX_AGENTS.md)
- [Development Workflow](DEVELOPMENT_WORKFLOW.md)
- [Decisions](DECISIONS.md)
- [Risks](RISKS.md)
- [Handoff Log](HANDOFF_LOG.md)
- [Internal Changelog](CHANGELOG_INTERNAL.md)
- [Workspace Audit](WORKSPACE_AUDIT.md)

## Owner

AU-AGENT-002 maintains navigation, discoverability, link integrity, terminology,
traceability, and document lifecycle. Content meaning remains owned by the
technical or product authority identified by each document.

## Lifecycle

Update this index whenever a document class, canonical source, or navigation
path changes. A document is not considered discoverable until its owning index
links to it.

## Adding Documents

Register the source in the correct index, use the required metadata, link rather
than duplicate definitions, update the glossary and traceability when relevant,
and run documentation validation. New canonical source classes must also be
added to `docs/SOURCE_OF_TRUTH.md`.

## Related Sources

- [Source of Truth Registry](SOURCE_OF_TRUTH.md)
- [Documentation Standard](standards/DOCUMENTATION_STANDARD.md)
- [Agent Registry](../.codex/AGENT_REGISTRY.md)
