# Project Context

## Product

`[CONFIRMED]` Abris Universe is a planned digital ecosystem for cross-stitch,
beadwork, and other craft disciplines.

`[CONFIRMED]` The stated long-term product landscape includes Smart Tracker and
Pattern Viewer, pattern import and conversion, PDF and specialized formats, an
internal pattern representation, progress tracking, multiple stitch types,
backstitch, beads, blended threads, parking, Color Flow, anchors, statistics,
Journal, Action Plan, offline operation, synchronization, AI capabilities,
Community, Creator Hub, Marketplace, Brand Space, QR activation, Education, and
analytics.

`[OPEN]` This landscape is a product vision, not an approved implementation
scope, roadmap, release plan, or architecture. No feature should be inferred as
part of the first release without a versioned product source.

## Responsibility Model

`[CONFIRMED]` Claude Cowork owns product vision, research, user problems, craft
domain meaning, UX, business logic, PRDs, scope, roadmap, priorities,
product-level requirements, acceptance criteria, privacy/security requirements,
and independent acceptance.

`[CONFIRMED]` Codex owns independent technical review, repository analysis,
technical feasibility, software architecture within approved constraints,
implementation, testing, migrations, APIs, data, applications, pattern
processing, offline/sync implementation, infrastructure, CI/CD, observability,
performance, secure implementation, and technical documentation.

`[DERIVED]` Codex must escalate necessary product changes and may recommend
alternatives, but it cannot silently redefine product intent.

`[CONFIRMED]` Engineering source authority and canonical document locations are
registered in `docs/SOURCE_OF_TRUTH.md`. AU-AGENT-002 maintains the registry but
cannot change its hierarchy independently.

## Confirmed Engineering Principles

- Pattern definitions and user progress are separate entities.
- Original input files are retained separately from derived representations.
- The internal representation must not depend on one external format.
- User corrections are separate from automated recognition output.
- AI-derived data requires provenance, confidence, and fallback behavior.
- Progress loss is unacceptable.
- Core tracking supports offline operation.
- Synchronization is conflict-tolerant and idempotent where required.
- Migrations are reversible or have a tested recovery plan.
- Large patterns are a baseline scenario and require measured performance.
- Security and privacy are architectural concerns.
- An MVP may narrow functionality but must avoid a deliberate dead-end
  architecture.

## Current Constraints and Unknowns

- `[CONFIRMED]` The approved Master Product Specification v1.0, product Decision
  Log, and AU-CDX-TASK-001 v1.0 are present under `product/`. The Task Package
  is ready for Codex review, not implementation.
- `[OPEN]` No technology stack, target platform order, architecture, data model,
  API, internal format, service provider, deployment model, or performance SLO
  has been approved.
- `[CONFIRMED]` The private implementation repository and Git history exist.
  `[OPEN]` Dependencies, secrets inventory, environments, executable source,
  and test data are not yet present.
- `[CONFIRMED]` AU-AGENT-001, Lead Software Architect & Development
  Orchestrator, is the first registered specialist and owns operational
  architecture, decomposition, contract coordination, integration, and the
  consolidated Completion Report.
- `[CONFIRMED]` AU-AGENT-002, Engineering Documentation Manager, is the
  permanent documentation specialist and owns documentation structure,
  navigation, consistency, approved terminology records, traceability, and
  lifecycle without owning technical or product meaning.
- `[OPEN]` No implementation-domain specialist or independent Engineering
  Quality reviewer has been supplied or registered.

These unknowns intentionally block product implementation but do not block the
governance baseline.
