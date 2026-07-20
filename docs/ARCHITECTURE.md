# Architecture and Repository Assessment

**Assessment ID:** AGENT-001-ASSESS-001
**Date:** 2026-07-20
**Owner:** AU-AGENT-001 — Lead Software Architect & Development Orchestrator
**Product architecture status:** `[OPEN]`
**Assessment status:** `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]`

## Executive Assessment

`[CONFIRMED]` No product software architecture can be recovered from the current
workspace. The directory is not a Git repository and contains only the
documentation governance baseline. There are no languages, frameworks,
dependency manifests, source modules, schemas, APIs, migrations, tests,
infrastructure definitions, CI/CD workflows, deployment targets, or runtime
commands to assess.

`[DERIVED]` Selecting a stack or drawing product component boundaries now would
turn unsupported assumptions into apparent commitments. Product architecture is
therefore intentionally unapproved until OQ-001, OQ-002, and the first versioned
Task Package are resolved.

## Current Non-Product Governance Architecture

The only established architecture is the technical governance flow:

```text
Project Owner / Claude Cowork product sources
                    |
                    v
        AU-CODEX-PRIMARY governance
     rules, registration, status, escalation
          /                         \
         v                           v
AU-AGENT-001 Lead Architect    AU-AGENT-002 Documentation Manager
technical meaning, decisions   structure, navigation, traceability
         |                           ^
         v                           |
Registered engineering agents ------+
domain meaning and evidence
         |
         v
 Independent Engineering Quality Review (not registered)
         |
         v
       Consolidated Completion Report
         |
         v
       Claude Cowork independent acceptance
```

This is an operating model, not the Abris Universe runtime architecture.

AU-AGENT-002 is a cross-cutting documentation steward, not an architecture
decision maker. AU-CODEX-PRIMARY retains governance and source hierarchy.
AU-AGENT-001 and assigned domain agents retain technical meaning. This
organizational extension does not define or change product or system
architecture. Canonical architecture sources and their authority are registered
through `docs/SOURCE_OF_TRUTH.md`.

## Confirmed Architectural Constraints

- Pattern, User Project, source file, imported pattern version, pattern data,
  and progress data require distinct identities and lifecycles.
- Original files are immutable inputs retained separately from derived data.
- Automated recognition and manual corrections have distinguishable provenance.
- Internal format version and pattern content version are different concepts.
- Pattern updates must not silently destroy progress.
- Core tracking is offline-capable; sync requires durable operations, retries,
  idempotency where required, conflict handling, and recovery.
- Critical migrations require validation, backup, and rollback or recovery.
- Viewer design must treat large patterns as a baseline and use measured
  performance targets.
- Security, privacy, testability, and observability are design inputs.

These constraints do not yet define physical schemas, protocols, services,
frameworks, or deployment topology.

## Repository Assessment Gaps

The following cannot yet be assessed:

- Existing module boundaries, coupling, code quality, and technical debt.
- Languages, frameworks, package ownership, and dependency/license risks.
- Data ownership, physical storage, indexes, migrations, and retention.
- API and event contracts, compatibility, and deprecation policy.
- Offline/sync semantics, concurrency, and recovery behavior.
- Import security boundaries and resource isolation.
- Viewer rendering model, memory budget, and performance baseline.
- Test architecture, coverage, fixtures, CI/CD, observability, and release safety.

## Proposed First ADR Sequence

No item below is approved. Each requires repository evidence, product inputs,
alternatives, consequences, migration/rollback analysis, affected modules, and
the named reviewers.

### ADR-P001 — Repository, Platform, and Delivery Topology

- **Status:** `[PROPOSED]`, blocked by OQ-001 and OQ-002.
- **Question:** Which repository topology, target platforms, stack boundaries,
  deployment units, and code-sharing strategy best satisfy the approved first
  release?

### ADR-P002 — Core Entity Identity and Version Boundaries

- **Status:** `[PROPOSED]`, blocked by the product domain source and relevant
  Pattern and Backend agent reviews.
- **Question:** How are Pattern, User Project, Source File, Imported Pattern
  Version, internal-format version, Pattern Data, corrections, and Progress Data
  identified, owned, versioned, retained, and migrated?

### ADR-P003 — Offline and Synchronization Consistency Model

- **Status:** `[PROPOSED]`, blocked by product flows, data requirements, and the
  future Backend/Data/Sync role.
- **Question:** Which durable operation, ordering, conflict, tombstone,
  multi-device, retry, idempotency, and recovery semantics protect progress?

### ADR-P004 — Internal Pattern Format and Import Boundary

- **Status:** `[PROPOSED]`, blocked by supported-format scope and the future
  Pattern Engine role.
- **Question:** Which versioned schema, extension mechanism, provenance model,
  validation, compatibility, and fixture strategy supports approved stitch and
  material capabilities without importer lock-in?

### ADR-P005 — Viewer Rendering and Performance Architecture

- **Status:** `[PROPOSED]`, blocked by platform scope, interaction requirements,
  benchmark datasets, and target budgets.
- **Question:** Which coordinate, layering, virtualization, caching,
  invalidation, threading, and memory strategy meets measured large-pattern
  goals?

### ADR-P006 — Trust Boundaries and File Processing Security

- **Status:** `[PROPOSED]`, blocked by approved security/privacy requirements and
  independent Engineering Quality/Security review.
- **Question:** Where are trust boundaries, object authorization, upload limits,
  malicious-file isolation, secret handling, encryption, logging, third-party
  transfer controls, and fallbacks enforced?

## Documents Requiring Later Updates

After repository and Task Package confirmation, update this file and create only
the substantiated documents among `SYSTEM_MAP.md`, `DATA_MODEL.md`,
`INTERNAL_PATTERN_FORMAT.md`, `API.md`, `SECURITY.md`, `PRIVACY.md`,
`TESTING.md`, `PERFORMANCE.md`, `TECHNICAL_DEBT.md`, `RELEASES.md`, and
`RUNBOOKS.md`. Do not create empty placeholders.

## Next Assessment Gate

AU-AGENT-001 should repeat this assessment when the repository origin and
versioned product source are confirmed. The next assessment must inspect Git
history and worktree state, source structure, manifests, schemas, migrations,
tests, environments, services, secrets inventory by variable name only, CI/CD,
deployment, observability, licenses, and documented run commands before
proposing product architecture.
