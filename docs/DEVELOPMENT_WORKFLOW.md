# Development Workflow

## 1. Task Intake

Substantive product work starts from a versioned Task Package containing, where
applicable: Task ID, title, version, source, context, problem, goal, user value,
priority, scope, out of scope, flows, functional/domain/business rules, states,
errors, edge cases, data, architecture constraints, APIs, offline/sync,
security, privacy, performance, analytics, acceptance criteria, required tests,
dependencies, risks, open questions, prohibited changes, related documents,
evidence requirements, rollback, independent reviewer, and Documentation Impact.

Resolve the Task Package and every affected canonical source through
`docs/SOURCE_OF_TRUTH.md` before design. Do not use a lower-authority duplicate
when a registered canonical source exists.

Documentation Impact is required and must be `None`, `Minor`, `Material`, or
`Breaking` as defined by `docs/standards/DOCUMENTATION_STANDARD.md`. A `None`
classification requires a rationale and affected-source check.

Missing critical information produces a Clarification Report; conflicting
information produces a Conflict Report. Non-critical gaps may use explicit,
reversible assumptions when the Task Package permits them.

## 2. Technical Review Gate

Before substantial implementation, prepare a Technical Design Proposal with:

1. Task ID and requirement version.
2. Technical understanding and current-code evidence.
3. Affected components and boundaries.
4. Proposed architecture and data flow.
5. Data model, API, migration, and compatibility impacts.
6. Offline/sync, security, performance, and observability impacts.
7. Test strategy and evidence plan.
8. Rollback and recovery.
9. Alternatives, risks, debt, implementation order, questions, and deviations.
10. Documentation Impact, affected canonical sources, expected documentation
    result, AU-AGENT-002 review need, and any proposed exception.

Critical deviations require product-owner or Claude Cowork resolution before the
conflicting implementation proceeds.

The Technical Review records its own Documentation Impact conclusion. It must
confirm or correct the Task Package and Technical Design classification, name
affected sources and approvers, and state whether documentation work is ready,
blocked, or requires a registered exception.

## 3. Clarification Report

Use: Clarification ID, Task ID/version, question, missing information, why it
matters, technical impact, options, recommended option, work that can continue,
blocked work, and decision owner.

## 4. Conflict Report

Use: Conflict ID, Task ID/version, conflicting requirements or evidence, facts,
technical and product impact, risks, options, Codex recommendation, required
decision, owner, and status.

## 5. Technical Alternative Proposal

Use: original requirement, proposed alternative, reason, benefits, drawbacks,
UX/data/performance/security/schedule impacts, migration cost, reversibility,
and recommendation. Do not implement a product-significant alternative silently.

## 6. Implementation

- Make small, reviewable changes tied to the Task ID.
- Preserve compatibility and unrelated work.
- Add behavior and proportionate tests together.
- Version formats and contracts; document migrations and recovery.
- Update documentation in the same task when behavior changes.
- Route non-`None` Documentation Impact through AU-AGENT-002 for structure,
  navigation, terminology, traceability, lifecycle, and documentation review.
- Preserve technical and product meaning; AU-AGENT-002 does not approve meaning.
- Register accepted temporary limitations in `docs/TECHNICAL_DEBT.md`.

## 7. Verification

Select the relevant unit, component, integration, contract, end-to-end,
regression, migration, performance, security, recovery, golden-file, and
property-based tests. Record exact commands, environment, fixtures, results, and
known limitations. A demonstration is not a substitute for repeatable evidence.

Documentation validation checks metadata, internal links, canonical-source
conflicts, duplication, terminology, indexes, traceability, and orphan status.
The appropriate content owner validates meaning.

## 8. Completion Report

The report includes: Task ID/version, summary, implemented and omitted scope,
deviations, changed files, architecture/data/migration/API impacts, tests and
results, performance/security evidence, known issues, debt, manual verification,
deployment, rollback, Documentation Impact, documentation results or registered
exception, AU-AGENT-002 review evidence, risks, and recommended next step.

If Documentation Impact is not `None`, the Completion Report cannot recommend
completion without the required documentation result or an approved registered
Documentation Exception.

Codex may report `[IMPLEMENTED]` and `[TESTED]`; only independent Claude Cowork
acceptance establishes project `[VERIFIED]`. AU-AGENT-003 uses a separate,
unbracketed Engineering Verification Status for its quality-gate decision.

## 9. Documentation Gate

AU-AGENT-002 verifies structure, navigation, consistency, approved terminology
records, traceability, metadata, references, lifecycle, duplication, and orphan
status. AU-AGENT-001 or the assigned domain owner verifies technical meaning.
AU-CODEX-PRIMARY verifies governance and source hierarchy.

The Engineering Handbook may explain and connect approved knowledge but must not
duplicate canonical ADRs, RFCs, specifications, architecture documents, or
product decisions.

## 10. Independent Engineering Verification Gate

After the integrated result and Completion Report are ready, AU-AGENT-003
reviews the exact source, Task Package, Technical Design, implementation, Test
Results, documentation, Completion Report, traceability, ADRs, Standards, and
all claimed evidence.

The review covers engineering quality, coding standards, architecture
compliance, documentation completeness, testing completeness, regression
coverage, security compliance, CI/CD readiness, release readiness, and
traceability. Missing evidence is treated as missing implementation.

AU-AGENT-003 issues an Engineering Verification Report under
`docs/reviews/engineering/` with findings, severity, Risk Assessment, Quality
Gate Decision, and one Engineering Verification Status: `VERIFIED`, `VERIFIED
WITH FINDINGS`, `REWORK REQUIRED`, or `BLOCKED`. These are unbracketed,
task-scoped gate values and never assign project `[VERIFIED]`.

Critical findings block completion. Any mandatory unresolved finding blocks the
Completion Report from proceeding to Claude. The implementation owner performs
remediation; AU-AGENT-003 does not edit implementation or redesign
architecture. Reverification preserves original findings and disposition
evidence.

## 11. Persistent Handoff

Update current status, focus, task state, handoff log, questions, decisions,
risks, debt, and internal changelog as applicable. The handoff must let a new
session continue without relying on chat history.

## 12. Claude-Codex Local Exchange

Use `collaboration/README.md` when Claude cannot reliably access the canonical
repository. Codex registers the task against an exact source commit, prepares
and validates the package, exports it to the controlled inbox, validates the
returned manifest and files, and imports valid output only into ignored
staging. Authorized owners review meaning before any canonical integration.

All write, synchronization, import, and archive commands default to dry-run and
require explicit `--apply`. No bridge script commits, pushes, merges, or
silently edits canonical product or technical sources. AU-CODEX-PRIMARY remains
the sole Git writer and GitHub operator.

## 13. Git and Delivery Conventions

The canonical private repository is `PhilipGrishin/abris-universe-platform` and
the default branch is `main`. Initial repository bootstrap commits are
owner-authorized. Subsequent substantive work should use a review branch and
pull request unless an explicit owner-approved workflow says otherwise.

Branch protection, required reviews, Issues, labels, Actions, release, and
deployment conventions remain `[PROPOSED]`. Do not enable automation, add
credentials, or claim CI evidence until separately approved and validated.

The cross-contour artifact lifecycle is defined in `docs/SHARED_WORKFLOW.md`.
