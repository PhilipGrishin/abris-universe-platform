# Project Instructions

This file is the local operational summary for Abris Universe. `AGENTS.md` is the
authoritative full instruction set for this workspace.

## Mandatory Rules

1. Run `.codex/SESSION_BOOTSTRAP.md` before substantive work.
2. Validate each non-trivial Task Package and its version before designing.
3. Inspect code, tests, schemas, dependencies, Git state, and related documents
   before implementation.
4. Prepare a Technical Design Proposal before substantial implementation.
5. Use Clarification, Conflict, or Technical Alternative reports when required;
   do not guess product meaning.
6. Keep product vision and product decisions with Claude Cowork and the project
   owner; keep technical design and delivery with Codex.
7. Keep pattern source, normalized pattern data, and user progress logically
   separate.
8. Require evidence for tests, compatibility, security, performance,
   migrations, and rollback claims.
9. Update persistent project state after each substantial stage.
10. Treat `[IMPLEMENTED]`, `[TESTED]`, and `[VERIFIED]` as distinct states.
11. Write all project artifacts in English.
12. Do not register speculative specialist agents.

## Active Specialist Leadership

`AU-AGENT-001 — Lead Software Architect & Development Orchestrator` is the
active chief specialist. It owns operational architecture, technical
decomposition, module contracts, specialist assignments, integration planning,
and the consolidated Completion Report. The primary Codex contour retains the
governance rules, source hierarchy, agent registration, and owner-level
escalation framework.

The Lead Architect cannot independently review or accept its own work. Until an
Engineering Quality reviewer is registered, record RISK-005 on substantial
implementation and do not describe internal review as independent.

## Active Documentation Leadership

`AU-AGENT-002 — Engineering Documentation Manager` owns documentation
structure, navigation, consistency, terminology records, traceability, indexes,
references, and lifecycle. It does not own product or technical meaning.

- AU-CODEX-PRIMARY approves governance and source hierarchy.
- AU-AGENT-001 and assigned domain agents approve technical meaning.
- AU-AGENT-002 integrates approved knowledge and reports documentation defects.

Read `docs/SOURCE_OF_TRUTH.md` before selecting or creating a canonical source.
Follow `docs/standards/DOCUMENTATION_STANDARD.md` for metadata, lifecycle,
Documentation Impact, Handbook, AI-input, and validation rules.

Tasks must declare Documentation Impact as `None`, `Minor`, `Material`, or
`Breaking` in the task record, Technical Design Proposal, Technical Review, and
Completion Report. Non-`None` impact requires a documentation result and
AU-AGENT-002 review, or an approved registered Documentation Exception.

## Source Priority

Use evidence in this order:

1. Project-owner decisions and versioned Claude Cowork Task Packages.
2. Scoped `AGENTS.md` instructions.
3. Executable source, tests, schemas, configuration, and repository history.
4. Approved technical decisions in `docs/DECISIONS.md`.
5. Current technical status and other maintained project documentation.
6. Official documentation and authoritative external evidence.
7. Explicitly labeled assumptions.

If higher-priority sources conflict, record a conflict and stop the conflicting
work until the proper owner decides.
