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
13. Use the controlled local bridge for Claude exchanges when direct repository
    access is unavailable; AU-CODEX-PRIMARY remains the sole Git writer.

## Active Specialist Leadership

`AU-AGENT-001 — Lead Software Architect & Development Orchestrator` is the
active chief specialist. It owns operational architecture, technical
decomposition, module contracts, specialist assignments, integration planning,
and the consolidated Completion Report. The primary Codex contour retains the
governance rules, source hierarchy, agent registration, and owner-level
escalation framework.

The Lead Architect cannot independently review or accept its own work. Until an
engineering result passes the separately assigned AU-AGENT-003 quality gate, do
not describe AU-AGENT-001 self-review as independent.

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

## Active Engineering Quality Leadership

`AU-AGENT-003 — Engineering Quality, DevSecOps & Security Lead` independently
reviews Codex engineering results before Claude Cowork product acceptance. It
reviews quality, evidence, testing, regressions, security, reliability,
documentation, traceability, CI/CD, and release readiness and issues an
Engineering Verification Report.

AU-AGENT-003 may block the Completion Report and require remediation but does
not implement features or fixes, modify implementation, redesign architecture,
change product requirements, approve product acceptance, or override the
Project Owner. Missing evidence is missing implementation.

Use only the unbracketed Engineering Verification Status values `VERIFIED`,
`VERIFIED WITH FINDINGS`, `REWORK REQUIRED`, and `BLOCKED` in its reports. They
do not assign project `[VERIFIED]`, which remains exclusive to Claude Cowork
independent acceptance.

## Active Pattern Engineering Leadership

`AU-AGENT-004 — Pattern Engine, Import, Rendering & Algorithms Lead` owns
pattern representation, parsing, supported-format import, rendering core,
algorithm correctness, compatibility, and pattern-processing performance and
memory behavior.

It designs and implements only inside approved product requirements,
AU-AGENT-001 system architecture, and registered cross-module contracts. It
must not implement UI, mix rendering with presentation, embed business rules in
algorithms, own backend or synchronization, change product or UX meaning,
approve its own quality, or override AU-AGENT-001.

Require deterministic import and rendering, platform-independent algorithms,
preserved original inputs, correctness before optimization, and reproducible
format, compatibility, benchmark, performance, coverage, documentation, and
known-limitation evidence. Role registration does not claim these
implementations or results exist.

## Source Priority

Use evidence in this order:

1. Project-owner decisions and approved versioned Claude Cowork Task Packages
   registered under `product/decisions/` and `product/task-packages/`.
2. Scoped `AGENTS.md` instructions.
3. Executable source, tests, schemas, configuration, and repository history.
4. Approved technical decisions in `docs/DECISIONS.md`.
5. Current technical status and other maintained project documentation.
6. Official documentation and authoritative external evidence.
7. Explicitly labeled assumptions.

If higher-priority sources conflict, record a conflict and stop the conflicting
work until the proper owner decides.

The Claude Cowork organization is registered separately in
`product/agents/README.md`; `AI_ORGANIZATION.md` links the product and
engineering registries without merging role activation or authority.

## Local Collaboration Bridge

Follow `collaboration/README.md` for the canonical twelve-step exchange. Exact
source identity, checksums, path confinement, safety validation, staging,
meaning review, and archive reference are mandatory. Generated packages and
the external bridge are non-canonical local state. Claude must not use Git or
directly edit this repository; AU-CODEX-PRIMARY alone integrates and publishes
accepted artifacts.

## Agent Registration Git Workflow

For each owner-supplied new agent, create a scoped branch from current `main`,
validate role coverage, governance, links, metadata, traceability, status
semantics, inactive-role boundaries, and applicable regression tests, then
publish a pull request and merge it automatically only when mergeable and all
required checks pass or none are configured. Never bypass conflicts, protection,
required review, failed checks, or unresolved mandatory findings.
