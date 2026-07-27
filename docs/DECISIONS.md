# Technical Decisions

## DEC-001 — Do Not Infer Product Architecture During Initialization

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Context:** The initial workspace contained no repository, code, or versioned
  product sources.
- **Decision:** Create only a governance and persistent-context baseline. Do not
  select a stack or create architecture, data model, API, internal pattern
  format, deployment, or feature implementation artifacts until their inputs are
  confirmed.
- **Reason:** This avoids converting assumptions into apparent product or
  technical commitments.
- **Consequence:** Product implementation is blocked until repository and source
  questions are resolved. The decision is reversible after evidence arrives.

## DEC-002 — Use Explicit Evidence Statuses

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Decision:** All project records distinguish confirmed, derived, assumed,
  open, conflicting, proposed, approved, implemented, tested, independently
  verified, deferred, rejected, and technical-debt states.
- **Consequence:** `[IMPLEMENTED]` and `[TESTED]` never imply `[VERIFIED]`.

## DEC-003 — Register Specialist Agents Only From Owner Instructions

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Decision:** Register no detailed specialist role until its instruction is
  provided by the project owner and overlap is reviewed.
- **Consequence:** The current registry contains only the primary technical
  governance contour and explicitly supplied specialist roles.

## DEC-004 — Separate the Governance Contour From the Lead Specialist

- **Status:** `[DERIVED]`
- **Date:** 2026-07-20
- **Related task:** AGENT-001
- **Context:** Both the original primary Codex instruction and the supplied Lead
  Architect instruction include technical review, coordination, documentation,
  and handoff responsibilities. The new instruction explicitly defines the Lead
  as the chief specialized agent.
- **Decision:** Treat AU-CODEX-PRIMARY as the project-wide governance envelope
  that owns rules, source priority, role registration, persistent state, and
  escalation ownership. Treat AU-AGENT-001 as the operational owner of product
  software architecture, decomposition, cross-module contracts, specialist
  coordination, integration, and consolidated Completion Reports.
- **Alternatives:** Collapse both records into one role; or leave duplicate
  ownership unresolved.
- **Reason:** The selected boundary preserves both owner instructions, gives the
  specialist a clear operational mandate, and avoids duplicate contract and
  architecture ownership.
- **Consequence:** AU-AGENT-001 authors technical delivery artifacts while the
  primary contour enforces and records the process. Neither can independently
  accept AU-AGENT-001 work.
- **Reversibility:** The owner can refine the boundary without changing product
  architecture or code.
- **Review status:** Owner correction is welcome if a different delegation model
  was intended.

## DEC-005 — Establish Documentation Stewardship as a Separate Engineering Role

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Related task:** AGENT-002
- **Context:** Engineering documentation responsibilities existed across the
  primary governance contour and Lead Architect, but no permanent role owned
  structure, navigation, terminology records, traceability, indexes, and
  lifecycle.
- **Decision:** Register AU-AGENT-002, Engineering Documentation Manager, as an
  integrated cross-cutting specialist. AU-CODEX-PRIMARY retains governance,
  source hierarchy, and organizational rules. AU-AGENT-001 and assigned domain
  agents retain technical meaning, architecture correctness, and engineering
  decisions. AU-AGENT-002 owns documentation structure, navigation,
  consistency, approved terminology records, traceability, and lifecycle.
- **Alternatives:** Leave documentation fragmented; make the role a standalone
  project; or transfer technical decision ownership to the documentation role.
- **Reason:** Separate stewardship improves maintainability and auditability
  without creating a parallel authority or changing engineering meaning.
- **Consequence:** Documentation Impact becomes a required delivery field.
  Non-`None` impact requires a documentation result or approved registered
  exception. The Handbook remains an explanatory reference layer, not a source
  that duplicates ADRs, RFCs, specifications, architecture, or product
  decisions.
- **Risks:** Authority confusion, duplicate sources, review bottlenecks, and dead
  documentation are tracked by RISK-006 and RISK-007.
- **Migration:** Existing documents remain in place. New indexes reference them;
  no content is moved or rewritten in this phase.
- **Rollback:** Remove the new documentation infrastructure and role references
  only through a project-owner decision; preserve any later canonical knowledge
  before removal.
- **Affected modules:** Engineering organization and documentation governance
  only. No product or runtime module is affected.
- **Review date:** Event-driven by source hierarchy, ownership, or repository
  integration changes; no calendar date is justified.

## DEC-006 — Use One Shared Repository With Separate Authority Contours

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Related task:** INIT-002
- **Context:** Product governance existed in a non-version-controlled Claude
  Cowork workspace while engineering governance existed in a separate non-Git
  Codex workspace. The Project Owner selected one private platform repository.
- **Decision:** Use `PhilipGrishin/abris-universe-platform` as the private shared
  repository for product sources, engineering governance, future
  implementation, evidence, and acceptance. Keep `product/` and the Codex
  engineering contour in separate source classes, registries, and authority
  paths.
- **Alternatives:** Separate product and engineering repositories; import the
  Claude workspace without classification; or merge both organizations into
  one authority model.
- **Reason:** One versioned platform improves traceability and handoff while
  explicit contour boundaries prevent product and technical authority drift.
- **Consequence:** Product decisions and Task Packages remain owned by the
  Project Owner and Claude Cowork. Technical decisions and implementation
  remain owned by Codex. AU-AGENT-002 integrates documentation without owning
  meaning. The external source workspace is provenance, not a competing live
  repository. Imported approved product sources retain their original language
  for fidelity; this does not change the English policy for new artifacts.
- **Reversibility:** Repository topology can change through a new owner decision
  and a non-destructive migration with preserved history and source mapping.
- **Owner:** Project Owner
- **Review status:** `[VERIFIED]` by the INIT-002 Independent Acceptance Report
  for the exact repository and authority-contour scope at source commit
  `1ccaace`; later implementation changes remain outside that decision.

## DEC-007 — Use a Synchronized External Claude-Codex Bridge

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`; exercised operating
  model `[VERIFIED]`
- **Date:** 2026-07-21
- **Related task:** BRIDGE-001
- **Context:** GitHub is canonical and Codex has repository access, but reliable
  direct Claude access to the repository is unconfirmed. Claude has an
  established external local workspace that must remain unchanged outside a new
  controlled exchange boundary.
- **Decision:** Use Option B: committed portable contracts, manifests, and
  tooling under `collaboration/`, with generated payloads in Git-ignored local
  runtime and a synchronized external `Collaboration-Bridge`. Store its absolute
  path only in Git-ignored local configuration. AU-CODEX-PRIMARY is the sole Git
  writer and GitHub operator.
- **Alternatives:** Option A inside the repository if reliable Claude access is
  later confirmed; direct ungoverned file copying; direct Claude Git access; or
  no local exchange.
- **Reason:** Option B uses Claude's established workspace while preserving one
  canonical repository, explicit authority, exact-source provenance, safety
  validation, and a reversible transport boundary.
- **Consequence:** Exchange payloads are non-canonical until validation,
  authorized meaning review, and Codex integration. All write-capable bridge
  commands default to dry-run. No bridge script commits, pushes, merges, or
  grants Claude repository write authority. Following the Project Owner
  disposition dated 2026-07-25, the registered Bridge is the exclusive route
  for all substantive Claude–Codex communication and artifact transfer,
  regardless of direct repository availability. Chat history is not evidence,
  and manual owner input is limited to the registered trigger phrases unless a
  later explicit owner governance decision changes the route.
- **Reversibility:** A later approved decision may adopt Option A or another
  transport. Existing manifests and archives remain traceable; no source
  history needs destructive migration.
- **Owner:** Project Owner / AU-CODEX-PRIMARY
- **Review status:** Exchange `AU-EX-20260721-001` completed a validated full
  round-trip. The exercised operating model is independently accepted; this does
  not verify every tooling implementation change or future exchange.

## OWNER-DEC-INIT003-DISPOSITIONS-001 — Resolve INIT-003 Governance Findings

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`
- **Date:** 2026-07-25
- **Source:** Explicit Project Owner directive dated 2026-07-25.
- **Related records:** INIT-003-OVR-001, INIT-003-OVR-002,
  INIT-003-OVR-004, INIT-003-OVR-005, and INIT-003-PD-001.
- **Decision:** Authorize wording-only normalization for explicit
  AU-CODEX-PRIMARY instruction provenance, standalone `Does not own` fields for
  AU-CODEX-PRIMARY and AU-AGENT-003, and the exclusive Collaboration Bridge
  communication rule. Separately authorize tested archive-aware exchange status
  reporting. Open a `PRODUCT_DECISION` exchange for Cowork DEC-005 through
  DEC-008 before TASK-THINSLICE-001 Technical Review and OQ-005 spike intake.
- **Meaning boundary:** The normalization changes no role authority, ownership,
  product decision, architecture, or implementation meaning. Cowork DEC-005
  through DEC-008 remain product inputs pending their validated Bridge return
  and canonical integration.
- **Consequence:** OVR-001, OVR-002, OVR-004, and OVR-005 are implemented.
  Development remains gated behind the Technical Review, which cannot start
  until the product-decision exchange is integrated.
- **Evidence:** `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`,
  `collaboration/README.md`, the canonical governance indexes,
  `collaboration/scripts/report-exchange-status.mjs`, and 19 passing Bridge
  unit tests.

## OWNER-DEC-F1-001 — Activate Specialized Codex Agents

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`; AU-AGENT-003 through AU-AGENT-006
  activation complete
- **Date:** 2026-07-21
- **Related records:** INIT-002-F1, INIT-002-F3, AU-CDX-TASK-001
- **Context:** Independent Acceptance Finding F1 confirmed that the Task Package
  names specialist Codex roles that were planned but inactive. Assigning the
  entire implementation to AU-AGENT-001 would collapse orchestration and
  specialist execution responsibilities.
- **Decision:** Activate specialized Codex agents in this order: AU-AGENT-003 —
  Engineering Quality, DevSecOps & Security Lead; AU-AGENT-004 — Pattern Engine,
  Import, Rendering & Algorithms Lead; AU-AGENT-005 — Backend, Data &
  Synchronization Lead; AU-AGENT-006 — Mobile/Web Client Lead. AU-AGENT-001
  retains intake, Technical Review, architecture, decomposition, assignment,
  contracts, integration, and the final engineering Completion Report.
- **Alternatives:** Assign all AU-CDX-TASK-001 work to AU-AGENT-001; retain the
  roles as inactive plans; or activate them without full operating instructions.
- **Reason:** Specialized execution preserves separation between architecture,
  implementation, independent engineering quality, and product acceptance.
- **Consequence:** The required specialist roles are individually instructed
  and registered. Product implementation remains subject to engineering intake,
  Technical Review, approved architecture, task assignment, and verification.
- **Reversibility:** A later owner decision may change role scope or assignment,
  but existing registration and task provenance must remain preserved.
- **Activation gate:** Names and order did not activate roles. Each role
  required its full owner-provided operating instruction, overlap analysis,
  registration, and the approved activation workflow.
- **Prohibited interpretation:** The decision does not approve product
  implementation, stack, runtime architecture, or AU-CDX-TASK-001 execution.
- **Owner:** Project Owner
- **Review status:** AU-AGENT-003 through AU-AGENT-006 were registered from
  their full owner instructions on 2026-07-25. Finding F1 is implemented; this
  status does not approve product implementation.

## OWNER-DEC-AGENT-MERGE-001 — Automatically Review and Merge Agent Registrations

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`
- **Date:** 2026-07-25
- **Related records:** AGENT-003, AGENT-004, AGENT-005, AGENT-006, RISK-011
- **Context:** The Project Owner directed Codex to check and merge branches
  automatically when new engineering agents are created.
- **Decision:** For owner-supplied agent-registration tasks, Codex creates a
  scoped branch from current `main`, validates the exact organizational and
  documentation change, publishes a pull request, checks mergeability and
  configured required checks, and merges automatically when all gates pass.
- **Scope:** Agent registration and its necessary governance, documentation,
  workflow, traceability, status, and navigation changes only.
- **Guardrails:** Do not merge with conflicts, failed or pending required
  checks, unmet branch protection or review requirements, unrelated work,
  unresolved mandatory findings, secret or path-safety defects, or an unclear
  target branch. No auto-merge rule authorizes product implementation or
  destructive history changes.
- **Alternatives:** Require a separate owner approval before every
  agent-registration merge; commit directly to `main`; or leave registration
  branches open.
- **Reason:** Checked automatic merging keeps the canonical organization current
  between sequential agent instructions while retaining review history and
  avoiding direct-to-main changes.
- **Consequence:** Codex records PR and validation evidence for each agent
  registration and stops for owner input only when a guardrail blocks safe
  merge.
- **Reversibility:** The Project Owner may revoke or narrow the workflow.
  Existing merge commits and PR provenance remain preserved.
- **Owner:** Project Owner / AU-CODEX-PRIMARY
- **Review status:** Exercised successfully by PR #1 for the prior linear
  Collaboration Bridge, acceptance, and AU-AGENT-003 branch chain, by PR #2 for
  AU-AGENT-004, and by PR #3 for AU-AGENT-005. AU-AGENT-006 uses the same gate.

## OWNER-DEC-TS001-PRODUCTION-TRANSITION-001 — Approve the Baseline-Aware Transition Window

- **Status:** `[APPROVED]`
- **Date:** 2026-07-27
- **Source:** Explicit Project Owner directive dated 2026-07-27 approving
  `AU-TAP-TS001-001` Alternative A.
- **Related task:** TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT; finding
  TS001-DEPLOY-005.
- **Context:** Run `30250084131` completely verified the candidate through the
  zero-traffic version override, promoted it, then exhausted the existing
  post-promotion smoke window. The final retained runner-edge observation
  still matched the exact registered prior baseline, and automatic rollback
  succeeded.
- **Decision:** Implement the baseline-aware post-promotion transition from
  `AU-TAP-TS001-001`. Continue polling only while GET status, HEAD status,
  content type, and body SHA-256 exactly match the registered prior baseline.
  When the exact candidate root sentinel appears, run one complete production
  semantic contract. Roll back immediately on an unrecognized response,
  transport failure, or candidate-contract failure.
- **Boundary:** The transition is limited to 61 observations and a strict
  120-second wall-clock window. The full candidate smoke is not generically
  retried. Evidence remains allowlisted. No product behavior, accepted
  executable application, DNS, secret scope, security-header contract, or
  rollback anchor changes.
- **Authorization:** Implement, independently review through AU-AGENT-003, and,
  only after protected merge and passing gates, perform one controlled
  production attempt.
- **Alternatives:** One-percent canary, access-protected preview hostname,
  fixed sleep/generic long retry, or no deployment, as evaluated in
  `AU-TAP-TS001-001`.
- **Consequence:** Exact implementation, deterministic tests, required CI run
  `30252463472`, and AU-AGENT-003 reverification passed at source `b4f25cda`;
  TS001-DEPLOY-005 is resolved. Protected merge produced `80d942ec`, and run
  `30253457090` exhausted the single authorized attempt with safe rollback.
  This decision grants no retry; TS001-DEPLOY-007 now requires a separately
  reviewed owner disposition.
- **Reversibility:** Revert the deployment-tooling commit; runtime rollback
  continues to target the registered immutable prior version.
- **Owner:** Project Owner

## OWNER-DEC-TS001-PRODUCTION-DELIVERY-002 — Approve Immutable Preview and Hostname Purge

- **Status:** `[APPROVED]`
- **Date:** 2026-07-27
- **Source:** Explicit Project Owner directive approving “A — Workers +
  immutable preview + purge,” followed by owner configuration of the dedicated
  GitHub production-environment secret and zone variable.
- **Related task:** TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT; High finding
  TS001-DEPLOY-007; `AU-TAP-TS001-002`.
- **Context:** Protected run `30253457090` demonstrated that the custom-domain
  version override could return a candidate sentinel immediately before the
  same edge returned the exact prior cached baseline during the full contract.
  The workflow rolled back safely, but that mechanism is not reusable.
- **Decision:** Verify the exact uploaded version through Wrangler's immutable
  `*.workers.dev` preview URL, promote only that version to 100 percent, purge
  cache only for `abris.653915.com`, and require three consecutive complete
  production contracts.
- **Boundary:** At most 25 production observations and 120 seconds. The exact
  prior baseline resets the stability quorum; unknown or internally
  inconsistent responses fail immediately. Promotion-or-later failure restores
  the prior immutable version, purges the hostname again, and verifies the
  registered baseline.
- **Security:** Use a separate Zone Cache Purge token restricted to
  `653915.com`; keep the existing Worker deployment token separate. Store
  secrets only in the GitHub `production` environment and retain no secret
  values in evidence.
- **Authorization:** Implement, independently verify through AU-AGENT-003,
  merge through protected `main`, and perform one controlled production
  attempt after all gates pass.
- **Consequence:** `AU-TAP-TS001-002` becomes the approved continuation
  contract. `AU-TAP-TS001-001` and run `30253457090` remain authoritative
  historical safety evidence but no longer define the next attempt mechanism.
- **Reversibility:** Revert the deployment-tooling commit and do not dispatch
  the production workflow; any runtime failure follows the recorded immutable
  rollback path.
- **Owner:** Project Owner

## TASK-THINSLICE-001 Proposed Architecture Decisions

The following task-scoped decisions remain `[PROPOSED]` and have independent
pre-implementation disposition `ACCEPTED_WITH_GATES` through
`AU-EX-20260725-005`. Their full context, alternatives, consequences, risks,
migration, rollback, evidence obligations, and review histories live in the ADR
library and are not duplicated here:

- [ADR-TS001-001](architecture/adr/ADR-TS001-001-canonical-pattern-and-oxs-boundary.md):
  canonical Pattern independent of OXS; evidence-gated coordinate and symbol
  mapping.
- [ADR-TS001-002](architecture/adr/ADR-TS001-002-tiled-canvas-rendering.md):
  tiled Canvas2D behind a stable renderer interface; WebGL deferred to measured
  evidence.
- [ADR-TS001-003](architecture/adr/ADR-TS001-003-indexeddb-progress-event-log.md):
  IndexedDB with an append-only local ProgressEvent log and atomic projections.
- [ADR-TS001-004](architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md):
  portable TypeScript workspace and immutable GitHub-to-Cloudflare delivery.

None of these records authorizes implementation. The architecture review and
AU-AGENT-003 design-only security review are complete; TD-GATE-004 is closed.
The ADRs remain `[PROPOSED]` behind their recorded fixture, implementation,
runtime, performance, and deployment evidence gates. Independent revision
confirmation `AU-EX-20260725-006` records
`CONFIRMED_ACCEPTED_WITH_GATES`, confirms TD-GATE-004 closed, and permits
route-1 fixture production and workspace scaffolding without authorizing
importer implementation, deployment, or project `[VERIFIED]`.

The project-original fixture stage is now `[IMPLEMENTED]`, `[TESTED]`.
TD-GATE-001 is closed only for the registered route-1 producer profile; this
evidence does not approve the ADR, other producer coordinate profiles, general
exact-symbol fidelity, runtime implementation, or deployment.

## OWNER-DEC-TS001-WORKER-MEMORY-001 — Accept the Phase 0 Worker-Memory Evidence Limitation

- **Status:** `[APPROVED]`
- **Date:** 2026-07-26
- **Source:** Explicit Project Owner directive dated 2026-07-26.
- **Related task:** TASK-THINSLICE-001, finding TS001-IMPL-002.
- **Context:** Registered Chromium main-thread memory signals do not measure
  transient dedicated import-Worker peak memory. The deterministic importer
  estimator is enforced admission control, not observed allocation.
- **Decision:** Accept the missing observed import-Worker peak-memory result as
  a documented Phase 0 evidence limitation only.
- **Conditions:** Keep the exact 384 MiB preflight estimator enforced and
  unit-tested as the operative Phase 0 control. Make actual import-Worker
  memory measurement mandatory in future Prototype 9.1 evidence before any
  500,000-stitch scale claim.
- **Alternatives:** Delay Phase 0 until a new Worker-memory measurement harness
  exists; or incorrectly treat the estimator/main-thread signal as observed
  Worker memory.
- **Reason:** The limitation is explicit and bounded while the deterministic
  control prevents unbounded admission. Deferring actual measurement does not
  authorize extrapolation to the future scale target.
- **Consequence:** The approved-limitation alternative of TS001-IMPL-002 is
  supplied for AU-AGENT-003 review. Prototype 9.1 cannot support a scale claim
  without actual Worker-memory evidence and independent review.
- **Reversibility:** A later measured result may supersede this Phase 0
  limitation. Raising or removing the control requires separate architecture,
  test, documentation, and approval work.
- **Owner:** Project Owner
- **Implementation record:** [AU-BENCH-TS001-LIM-001](assurance/benchmarks/TASK-THINSLICE-001_IMPORT_WORKER_MEMORY_LIMITATION.md)
- **Product-source cross-reference:** `[OPEN]` as
  PROD-DEC-014; `TS001-ACCEPT-F-16` is resolved without changing this
  engineering decision's meaning.

## OWNER-DEC-CODEX-HANDOFF-001 — Codex Completion Marker

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`
- **Date:** 2026-07-25
- **Context:** The Project Owner manually transfers completed Codex work to
  Claude through the registered Collaboration Bridge trigger flow.
- **Decision:** Every completed Codex work package that is ready for
  owner-mediated handoff to Claude must end its final user-facing response with
  the exact standalone line `Codex finished`.
- **Boundary:** The marker records transport readiness only. It is not
  engineering evidence, approval, product acceptance, or `[VERIFIED]` status.
- **Owner:** Project Owner
- **Implemented by:** AU-CODEX-PRIMARY; AU-AGENT-002 maintains the documented
  rule and navigation.
- **Related records:** `AGENTS.md`, `.codex/PROJECT_INSTRUCTIONS.md`,
  `collaboration/README.md`, `docs/SHARED_WORKFLOW.md`, and
  `docs/SOURCE_OF_TRUTH.md`.

## Decision Process

Future entries should include Decision ID, status, date, context, decision,
alternatives, rationale, consequences, reversibility, owner, and related Task
IDs. Product decisions are referenced here only as constraints; they remain in
the authoritative product source registered through
`docs/SOURCE_OF_TRUTH.md`.
