# Technical Risk Register

## RISK-001 — Work Starts in the Wrong Repository

- **Status:** `[IMPLEMENTED]` mitigation; residual monitoring
- **Probability:** Low
- **Impact:** High
- **Trigger:** Work targets a repository other than the registered canonical
  repository or an unreviewed external copy is treated as current.
- **Affected areas:** All implementation, Git history, CI/CD, and documentation.
- **Prevention:** Resolve repository identity through
  `docs/SOURCE_OF_TRUTH.md` during bootstrap and use the configured `origin`.
- **Mitigation:** Canonical repository, branch, remote, and source import are
  registered with provenance and checksums.
- **Fallback:** Stop work, compare histories and source maps, and perform only an
  owner-approved non-destructive migration.
- **Owner:** Project owner

## RISK-002 — Product Behavior Is Invented

- **Status:** `[OPEN]`
- **Probability:** High without controls
- **Impact:** High
- **Trigger:** Design or implementation begins without a versioned Task Package
  and authoritative product documents.
- **Affected areas:** UX, domain model, data, architecture, tests, schedule, and
  acceptance.
- **Prevention:** Enforce Task Package validation and Technical Review gates.
- **Mitigation:** Label assumptions and issue Clarification or Conflict Reports.
- **Fallback:** Stop conflicting work and return a decision package to Claude
  Cowork or the project owner.
- **Owner:** Primary Codex role

## RISK-003 — Documentation Diverges From Executable Reality

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** Medium to High
- **Trigger:** Code arrives or changes without updating current status and
  technical records.
- **Affected areas:** Session continuity, design decisions, tests, and handoff.
- **Prevention:** Run session bootstrap and update persistent state in the same
  task as behavior changes. Use AU-AGENT-002 review, the Source of Truth
  Registry, Documentation Impact, indexes, and traceability.
- **Mitigation:** Prefer source, tests, schemas, configuration, and history over
  stale prose; record conflicts immediately.
- **Fallback:** Perform a fresh repository audit and mark stale claims.
- **Owner:** Primary Codex role

## RISK-004 — High-Risk Domains Lack Evidence

- **Status:** `[OPEN]`
- **Probability:** Unknown
- **Impact:** Critical
- **Trigger:** Work begins on file import, closed formats, pattern recognition,
  progress, offline/sync, migrations, rights, payments, backup, or restore
  without specific design and verification evidence.
- **Affected areas:** Data integrity, security, privacy, legal exposure,
  performance, and roadmap.
- **Prevention:** Require stricter design review, threat analysis, recovery plan,
  representative fixtures, and proportionate automated tests.
- **Mitigation:** Limit scope, preserve originals, use versioned contracts, and
  make operations idempotent where required.
- **Fallback:** Disable or roll back the affected capability using the approved
  task-specific plan.
- **Owner:** AU-AGENT-004 for Pattern Engine/import/rendering evidence;
  AU-AGENT-005 for backend/data/sync/migration/backup/recovery evidence;
  AU-AGENT-006 for client integration/offline/accessibility/responsiveness/
  supported-platform/performance evidence;
  AU-AGENT-003 for independent engineering verification; task-specific owners
  for remaining areas

## RISK-005 — Independent Engineering Review Is Missing or Bypassed

- **Status:** `[IMPLEMENTED]` role-registration mitigation; residual assignment
  monitoring
- **Probability:** Low when the quality gate is enforced
- **Impact:** High for substantial implementation
- **Trigger:** A Codex engineering result reaches completion or Claude handoff
  without an independent AU-AGENT-003 review assignment and report.
- **Affected areas:** Architecture review, security, performance, integration,
  release confidence, and acceptance evidence.
- **Prevention:** AU-AGENT-003 is registered and the Development Workflow
  requires its engineering quality gate before Claude product acceptance.
- **Mitigation:** Assign AU-AGENT-003 independently for each engineering result,
  preserve exact evidence, findings, and dispositions, and keep self-review
  labeled non-independent.
- **Fallback:** Block the Completion Report and request an independent
  AU-AGENT-003 review; if independence cannot be established, escalate to
  AU-CODEX-PRIMARY and the Project Owner.
- **Owner:** AU-CODEX-PRIMARY for gate enforcement; AU-AGENT-003 for review

## RISK-006 — Documentation Authority Is Confused With Meaning Authority

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** AU-AGENT-002 changes technical/product meaning or a Handbook,
  index, glossary, or traceability record becomes a parallel source of truth.
- **Affected areas:** Architecture, product behavior, specifications,
  terminology, task acceptance, and long-term maintainability.
- **Prevention:** Enforce the three-way ownership boundary and
  `docs/SOURCE_OF_TRUTH.md`; require content-owner approval for meaning changes;
  use references instead of duplicate definitions.
- **Mitigation:** Issue a Documentation Review Report, mark the conflict, stop
  relying on the lower-authority source, and route correction to the proper
  owner.
- **Fallback:** Restore the last approved canonical source and explicitly
  supersede or withdraw the conflicting document without deleting history.
- **Owner:** AU-AGENT-002 for detection; AU-CODEX-PRIMARY or relevant content
  owner for resolution

## RISK-007 — Documentation Governance Becomes a Bottleneck or Dead Structure

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** Medium
- **Trigger:** Every trivial task requires heavy review, indexes are created
  without content or ownership, or documentation is not maintained after
  creation.
- **Affected areas:** Delivery speed, maintenance cost, discoverability, and
  engineering trust.
- **Prevention:** Use the four-level Documentation Impact classification; allow
  concise `None` rationale and lightweight `Minor` review; create documents only
  for a defined purpose with owner, lifecycle, addition rules, and source links.
- **Mitigation:** Consolidate navigation by reference, report orphan/dead
  documents, and remove unnecessary process through an approved governance
  change without silently deleting knowledge.
- **Fallback:** Register a time-bounded Documentation Exception or simplify the
  process with AU-CODEX-PRIMARY approval while preserving required traceability.
- **Owner:** AU-AGENT-002 and AU-CODEX-PRIMARY

## RISK-008 — Shared Repository Blurs Product and Engineering Authority

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A product draft is treated as an approved engineering decision,
  a Codex proposal changes product meaning, or one agent registry is used to
  infer activation in the other organization.
- **Affected areas:** Requirements, architecture, role assignments, acceptance,
  traceability, and implementation scope.
- **Prevention:** Maintain separate `product/` and Codex registries, route all
  conflicts through `docs/SOURCE_OF_TRUTH.md`, and use
  `AI_ORGANIZATION.md` only as a navigation layer.
- **Mitigation:** Mark drafts and planned roles explicitly; require content-owner
  review and task-version traceability at every handoff.
- **Fallback:** Stop affected work, issue a Conflict Report, restore reliance on
  the higher-authority source, and record the owner decision.
- **Owner:** Project Owner, AU-CODEX-PRIMARY, and product coordination owner

## RISK-009 — Local Exchange Introduces Unsafe or Stale Artifacts

- **Status:** `[OPEN]`, controlled
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A package uses a stale commit, a return contains an unsafe or
  unregistered file, a checksum differs, a local path leaks into a committed
  artifact, or transport is mistaken for acceptance.
- **Affected areas:** Repository integrity, confidentiality, provenance,
  independent acceptance, product meaning, and documentation lifecycle.
- **Prevention:** Use exact source commits, unique Exchange IDs, schema and
  status validation, path confinement, symlink/binary/secret/size checks,
  registered extensions, SHA-256 checksums, Git-ignored runtime state, and
  dry-run-by-default write commands. Keep AU-CODEX-PRIMARY as sole Git writer.
- **Mitigation:** Reject invalid returns before staging, preserve evidence,
  regenerate stale packages, require authorized meaning review, and keep every
  state below `[VERIFIED]` until independent acceptance.
- **Archive-status control:** `[IMPLEMENTED]`, `[TESTED]` The status reporter
  distinguishes registered, prepared, exported, returned, integrated, and
  archived states. It revalidates archived task/return manifests, the archive
  record, canonical outcome, canonical report checksum, and archived
  return-manifest checksum. An advanced source branch is reported as
  `HISTORICAL_ARCHIVED`, not as an active-exchange failure.
- **Residual limitation:** Archive-aware reporting detects missing or
  inconsistent registered evidence but cannot recover deleted external archive
  data or independently verify the storage device. OVR-004 tooling is not
  project `[VERIFIED]`.
- **Fallback:** Stop the exchange, quarantine the affected local package, issue
  a security or conflict report, rotate any exposed credential through its
  owner, and resume only from a new Exchange ID and clean source commit.
- **Owner:** AU-CODEX-PRIMARY; AU-AGENT-002 for documentation lifecycle;
  applicable product or technical owner for meaning

## RISK-010 — Canonical Repository and Claude Workspace Copies Diverge

- **Status:** `[OPEN]`, controlled by exchange policy
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A maintained product artifact is edited independently in the
  external Claude workspace after its repository copy became canonical.
- **Affected areas:** Product meaning, provenance, requirements, decisions,
  Task Packages, acceptance, and source hierarchy.
- **Prevention:** Treat repository artifacts as canonical; treat external copies
  as drafting or bridge state; route changes through unique exchanges with exact
  source identity, checksums, and explicit integration mapping.
- **Mitigation:** Detect checksum or content divergence before import, stop
  integration, identify the authorized source owner, and produce a controlled
  source-difference review.
- **Fallback:** Preserve both versions without overwrite, issue a Conflict
  Report, and require the Project Owner or Claude product authority to select
  the canonical meaning before Codex integration.
- **Owner:** Claude Cowork product coordination owner for local workflow;
  AU-CODEX-PRIMARY for repository exchange enforcement

## RISK-011 — Agent Registration Auto-Merge Bypasses Review

- **Status:** `[IMPLEMENTED]` controls; residual monitoring
- **Probability:** Low when guardrails are enforced
- **Impact:** High
- **Trigger:** An agent-registration branch merges with conflicts, unrelated
  changes, failed or pending required checks, unmet repository protection,
  unresolved mandatory findings, unsafe content, or incomplete role coverage.
- **Affected areas:** Engineering authority, source hierarchy, agent
  independence, workflow gates, traceability, and repository history.
- **Prevention:** Limit auto-merge to owner-supplied agent registration; branch
  from current `main`; inspect the exact diff; validate role coverage, links,
  metadata, terminology, traceability, inactive-role boundaries, safety, and
  applicable regression tests; create a PR; confirm mergeability and configured
  checks.
- **Mitigation:** Stop automatic merge on any failed guardrail, preserve the
  branch and PR evidence, remediate in the same scoped branch, and rerun all
  affected checks.
- **Fallback:** Leave the PR open and request Project Owner direction when a
  conflict, required review, protection rule, unclear target, or mandatory
  finding cannot be resolved safely.
- **Owner:** AU-CODEX-PRIMARY

## RISK-012 — Import Format or Fixtures Create Lock-In, Security, or Rights Exposure

- **Status:** `[OPEN]`, format and rights rule resolved; route-1 coordinate,
  literal-symbol, bounded importer-core, and security-limit evidence
  `[TESTED]`; other producers, Worker/persistence integration, and independent
  implementation verification pending
- **Probability:** High without the OQ-005 and fixture gates
- **Impact:** High
- **Trigger:** Importer development starts from an undocumented/proprietary
  format, untrusted XML lacks resource limits, a source format dictates the
  canonical model, or third-party samples are committed without redistribution
  and derivative authority.
- **Affected areas:** Pattern correctness, data loss, security, compatibility,
  legal exposure, tests, repository distribution, and roadmap.
- **Prevention:** Use the confirmed OXS 1.0 selection; preserve original
  files; define a mapping contract; keep Symbol separate from PaletteItem and
  Pattern separate from Progress; disable unsafe XML features; impose resource
  limits; require fixture provenance and permission.
- **Mitigation:** PROD-DEC-009 resolves the format, terminology, and rights-safe
  acquisition rule. The Technical Design and ADR-TS001-001 define the bounded
  mapping and prohibit heuristic coordinate/symbol interpretation. The
  route-1 profile has deterministic golden, malformed, size-limit, coordinate,
  palette-reference, and unsupported-content fixtures. The importer core now
  uses a non-DOM SAX parser, rejects DTD/processing instructions and unknown
  producer profiles, enforces the registered hard limits, keeps source progress
  out of canonical Progress, and produces bounded reports. Dedicated Worker
  integration, source Blob retention, and atomic canonical persistence are
  now tested through the browser flow. Consolidated independent verification
  remains open. Keep unregistered producer profiles blocked or rejected.
  PROD-DEC-011 keeps the four
  owner-granted XSP binaries outside the Bridge and Git pending a separate
  owner-controlled transfer and prioritizes licensed XSD export over reverse
  engineering for Phase 1.
- **Fallback:** Reject the affected format or fixture, preserve evidence,
  disable the importer, restore the last known-good static deployment, and
  return the choice through a Technical Alternative or Conflict Report.
- **Owner:** AU-AGENT-004 for importer evidence; AU-AGENT-001 for architecture
  disposition; AU-AGENT-003 for independent security/quality verification;
  Project Owner or rights holder for fixture permission

## RISK-013 — Browser-Local Progress Is Lost or Misreported as Saved

- **Status:** `[OPEN]`; repository and client functional controls
  `[IMPLEMENTED]`, `[TESTED]`; repository independently
  `VERIFIED WITH FINDINGS`; consolidated TS001-PERSIST-006 resolved only for
  the declared Chromium/macOS Phase 0 scope
- **Probability:** Medium
- **Impact:** High
- **Trigger:** IndexedDB is unavailable, quota is exhausted, storage is evicted,
  an upgrade fails, or optimistic UI state is presented as durably saved.
- **Affected areas:** Progress integrity, user trust, reload recovery, rollback,
  and Phase 1 compatibility.
- **Prevention:** Keep Pattern and Progress separate; use short atomic
  transactions, append-only idempotent events with `deviceId`, in-transaction
  sequence allocation and payload hashes, a Web Locks single-writer policy
  across tabs, a rebuildable projection, strict IndexedDB durability when
  supported, commit-driven save status, persistent-storage requests, explicit
  quota errors, and one-release schema rollback compatibility.
- **Mitigation:** Revert failed optimistic state to the last committed
  projection, retain the live session, expose `not saved`, and stop release on
  failed two-context, idempotency, reload, or recovery evidence. Record the
  relaxed-durability residual on browsers that do not support strict mode.
  The schema-v1 repository has focused atomic rollback, blocked-upgrade,
  simulated quota, persistence-denial, idempotency, lock-failure, reopen, and
  projection-rebuild tests. The exact Chromium/macOS browser flow observed a
  real transaction abort, exact Web Locks contention with visible `Read-only`,
  blocked IndexedDB upgrade, persistent-storage denial, save/reload, and
  10,000-event rebuild. Safe real quota/eviction, power loss, strict-durability,
  and broader-browser evidence remain open.
  AU-AGENT-003 resolved repository findings TS001-PERSIST-001 through
  TS001-PERSIST-005 at exact commit `854073c`; consolidated reverification at
  `6da2f9e` resolves TS001-PERSIST-006 only for the declared profile. Safe
  quota/eviction, power loss, and additional-platform claims remain prohibited.
- **Fallback:** Roll back the client without deleting IndexedDB and recover the
  projection from retained events. Manual backup remains out of approved Phase
  0 scope.
- **Owner:** AU-AGENT-005 for persistence design; AU-AGENT-006 for client
  surfacing; AU-AGENT-003 for independent verification

## RISK-014 — First Cloudflare Deployment Has No Recoverable Rollback Anchor

- **Status:** Mitigation `[TESTED]` in failed-closed runs `30247393181` and
  `30248680612`; exact rollback anchor, route ownership, and retained preflight
  artifact recorded; TD-GATE-003 closed; production promotion remains `[OPEN]`
- **Probability:** Unknown
- **Impact:** High
- **Trigger:** The current `abris-universe` placeholder is replaced before its
  immutable version ID or recoverable artifact is recorded.
- **Affected areas:** `abris.653915.com`, production availability, auditability,
  and deployment rollback.
- **Prevention:** Complete TD-GATE-003 before first production deployment:
  record the current Worker/version, route, smoke baseline, and restorable
  artifact; keep DNS unchanged; deploy immutable versions through protected
  CI; serve and assert CSP, `X-Content-Type-Options`, `frame-ancestors`, and
  `Referrer-Policy` controls.
- **Mitigation:** Smoke the uploaded version before promotion, record prior and
  new version IDs, serialize production deployments, and automatically roll
  back on failed production smoke.
- **Current evidence:** The main-only GitHub `production` environment and
  versioned upload/zero-traffic smoke/promotion/rollback workflow are
  implemented. Deterministic tests cover failure before and after promotion,
  confirm the exact prior version at 100 percent, and verify the recorded
  public rollback baseline. Placeholder HTTPS `200` body hash
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`
  is recorded. Attempt 1 restored immutable prior version
  `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent after rejecting a
  zero-traffic candidate. The corrected preflight now requires exact
  hostname-to-Worker assignment and retains its hidden JSON artifacts.
  AU-AGENT-003 independently reverified the correction with 17 focused tests
  and exact-source remote CI. Run `30248680612` retained the exact
  `abris.653915.com` to `abris-universe` assignment, preflight, and lifecycle
  evidence; candidate `b855e2e0` stayed at zero traffic and the prior version
  and baseline were restored after the override remained semantically stale.
- **Fallback:** If no prior version is recoverable, do not deploy until the
  Project Owner approves a specific replacement rollback artifact.
- **Owner:** AU-AGENT-001; AU-AGENT-003 reviews CI/CD and release evidence

## RISK-015 — Same-Origin Requests Expose Pattern-Derived Data

- **Status:** `[OPEN]`; inventory, static check, CSP, local header controls, and
  measured-profile Resource Timing capture `[IMPLEMENTED]`, `[TESTED]`;
  independent disposition and production assertion pending
- **Probability:** Low with the implemented local controls; unknown in
  production until assertion
- **Impact:** High
- **Trigger:** Production code makes an unregistered same-origin connection,
  keeps `connect-src 'self'` without a justified runtime need, or places
  pattern-derived content in a URL, request body, header, log, analytics event,
  or telemetry.
- **Affected areas:** Pattern confidentiality, local-only privacy boundary,
  CSP effectiveness, Cloudflare delivery, security evidence, and user trust.
- **Prevention:** Maintain a reviewed minimum runtime request inventory; use
  `connect-src 'none'` when no script-initiated connection is required; permit
  only reviewed non-pattern static metadata otherwise; prohibit analytics and
  telemetry for pattern data.
- **Mitigation:** Compare a browser runtime capture against the inventory across
  import, render, toggle, reload, and representative error paths; block
  deployment on an unexpected request or pattern-derived payload. Exact source
  `35bbb34` has no client connection API, uses `connect-src 'none'`, and passed
  local workerd header/method smoke. The measured Chromium/macOS Resource
  Timing inventory contains only registered same-origin assets; AU-AGENT-003
  must decide its finding sufficiency. Production assertions remain mandatory.
- **Fallback:** Disable the offending connection or feature, tighten CSP,
  rebuild the immutable artifact, repeat security review and smoke evidence,
  and deploy only after the finding is cleared.
- **Owner:** AU-AGENT-001 for the contract; AU-AGENT-006 for client evidence;
  AU-AGENT-003 for independent reverification

## RISK-016 — Renderer Core Evidence Is Mistaken for Browser Readiness

- **Status:** `[OPEN]`; bounded core and browser functional controls
  `[IMPLEMENTED]`, `[TESTED]`; consolidated Engineering Verification Status
  `VERIFIED WITH FINDINGS`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A Node Canvas-contract signal or capability selector is treated
  as proof of browser pixels, OffscreenCanvas Worker operation, accessibility,
  glyph-atlas behavior, device performance, or production readiness.
- **Affected areas:** Rendering correctness, symbol readability,
  accessibility, interaction, performance, memory, and release confidence.
- **Prevention:** Keep core, browser adapter, Worker, client interaction,
  accessibility, rendering-golden, and controlled benchmark evidence distinct.
  Require exact-source AU-AGENT-003 review and the task benchmark plan before
  release claims.
- **Mitigation:** The renderer core bounds viewport work, rejects stale
  requests, separates static/progress layers, validates provider data, budgets
  changed overlays, restores committed state after save failure, and records
  its Node measurement explicitly as a non-acceptance regression signal.
  AU-AGENT-003 resolved all mandatory renderer-core findings at exact
  `930cad2`. Exact remediation source `1c2bd5d` adds the approved
  OffscreenCanvas Worker, bounded glyph atlas and tile-raster cache,
  incremental main-thread fallback, accessible browser integration, and
  source-qualified measured-profile evidence. Listed budgets pass on the
  recorded Chromium/macOS profile. Exact source `d69b5c5` additionally
  isolates the steady-gesture scenario with zero long tasks and manually
  dispositions the remaining contrast targets. Exact source `4009944` now has
  separate registered DPR1 reference and owner-confirmed 4× constrained raw
  profiles. AU-AGENT-003 reverified evidence package `04302399`, accepted the
  owner-confirmed 4× provenance and passing method-conforming metric subsets,
  but kept both complete profiles open for Viewer TTI and retained-memory
  evidence. Exact source `d36a827` adds 100-sample profile TTI distributions
  and signed baseline/current/peak main-thread heap signals. AU-AGENT-003
  reverified package `15ea8f93` and resolved the Viewer TTI and registered
  main-thread retained-memory remainders for the documented observational
  method. The Project Owner accepted missing observed import-Worker peak
  memory as a Phase 0 limitation while retaining the unit-tested 384 MiB
  admission control and making actual Prototype 9.1 measurement mandatory
  before any 500,000-stitch scale claim. AU-AGENT-003 independently confirmed
  the limitation and resolved TS001-IMPL-002 for bounded Phase 0. Exact source
  `470a30a` adds Project Owner-confirmed corrected physical Tab and VoiceOver
  evidence. AU-AGENT-003 accepted it at package `58d5832f` and resolved
  TS001-IMPL-003 only for Chrome 150/macOS 26.5.2. The missing VoiceOver
  version, exact viewport, session recording, and broader-browser evidence
  remain open and cannot be generalized.
- **Fallback:** Retain the stable renderer interface, disable a failing
  execution path, use the incremental main-thread fallback, and do not promote
  the release until mandatory findings and browser gates pass.
- **Owner:** AU-AGENT-004 for renderer correctness and performance;
  AU-AGENT-006 for browser/client/accessibility evidence; AU-AGENT-003 for
  independent engineering verification

## RISK-017 — Pinned GitHub Actions Lag the Hosted Node Runtime

- **Status:** `[OPEN]`; non-blocking maintenance recommendation
- **Probability:** Medium
- **Impact:** Medium
- **Trigger:** A SHA-pinned JavaScript action that still declares Node 20
  stops working when GitHub removes its compatibility override or changes the
  hosted runtime.
- **Affected areas:** CI availability, build provenance, dependency audit,
  static-artifact retention, and delivery lead time.
- **Prevention:** Keep actions pinned to immutable full commits. Periodically
  review upstream Node 24-native releases, provenance, changelogs, permissions,
  and compatibility without replacing pins with mutable tags.
- **Mitigation:** Update each action through a separate tested dependency/CI
  task with exact-head GitHub Actions evidence and no permission expansion.
- **Fallback:** Retain the last passing pins while the compatibility override
  remains available; if a pin fails, block promotion and use a reviewed
  replacement commit rather than bypassing CI.
- **Owner:** AU-CODEX-PRIMARY; AU-AGENT-003 reviews the resulting CI evidence

## RISK-018 — Non-Blocking Acceptance Findings Lose Lifecycle Ownership

- **Status:** `[OPEN]`; controlled by separate follow-up records
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A later task touches an accepted finding but neither closes it
  with evidence nor explicitly carries it forward.
- **Affected areas:** Import compatibility, product scope, progress integrity,
  client error semantics, accessibility, evidence portability, traceability,
  and future review reproducibility.
- **Prevention:** Treat TS001-ACCEPT-F-01 through F-16 as independent records
  in `docs/TASKS.md`; every later Task Package and Technical Review must check
  applicable records.
- **Mitigation:** Block completion of an affected later task until the finding
  is resolved, deferred by authorized disposition, or explicitly inherited
  with unchanged risk.
- **Fallback:** Preserve the bounded TASK-THINSLICE-001 acceptance while
  withholding broader compatibility, scale, release, production, or
  deployment claims.
- **Owner:** AU-CODEX-PRIMARY for routing; named finding owners for closure;
  AU-AGENT-003 for engineering reverification where applicable

## RISK-019 — Default Route Lags Verified Candidate After Promotion

- **Status:** `[OPEN]`; attempts 3 and 4 evidence retained; prior continuation
  superseded; replacement `AU-TAP-TS001-002` `[APPROVED]`, `[IMPLEMENTED]`,
  `[TESTED]`, exact-source Engineering Verification Status `VERIFIED`;
  attempt 6 live evidence retained; production continuation `REWORK REQUIRED`
- **Probability:** Observed once after a successful zero-traffic candidate
  smoke
- **Impact:** High
- **Trigger:** The version override selects and fully verifies the candidate,
  but the workflow runner continues to receive the exact prior cached baseline
  after promotion for longer than the current production-smoke window.
- **Affected areas:** Production availability, security-header assertions,
  deployment confidence, rollback timing, and release auditability.
- **Prevention:** Verify the exact immutable Workers preview before traffic
  mutation. Promote only its captured version ID, purge only the registered
  hostname, and require a three-pass complete production stability quorum. Do
  not retry an unrecognized response.
- **Mitigation:** Attempt 3 retained the exact candidate provenance and
  security contract at zero traffic, classified the post-promotion response as
  the registered prior body with `cf-cache-status: HIT`, and restored immutable
  prior version `d1f2b05d-77d0-4d53-9c7a-73d61135979e` plus the complete public
  baseline. The owner-approved implementation polls only while observations
  exactly match that registered prior baseline, applies 61-observation and
  strict 120-second ceilings, runs one full contract at the exact candidate
  sentinel, and immediately fails every unknown, transport, timeout, or
  candidate-contract state into rollback. Twenty-seven focused tests and
  required CI run `30252463472` pass; AU-AGENT-003 independently resolved
  TS001-DEPLOY-005 at exact source `b4f25cda`. Run `30253457090` then proved
  that one edge can return the exact candidate sentinel immediately before the
  one-shot complete contract receives the exact prior cached baseline. The
  approved state machine rejected that response and restored the exact prior
  version/baseline.
  The Project Owner then approved `AU-TAP-TS001-002`. Its implementation uses
  a separate zone-scoped Cache Purge token, 25-observation/120-second
  production bounds, exact prior/candidate classification, and cache purge
  both after promotion and rollback. Forty-three focused deployment tests and
  the complete local repository gate pass. AU-AGENT-003 exact-source review at
  `1054a2f0` resolves TS001-DEPLOY-008 through TS001-DEPLOY-011 with no
  remaining finding; both CI runs pass. Attempt 6 later passed immutable
  preview, promotion, and purge, but failed on candidate endpoint instability;
  RISK-021 and TS001-DEPLOY-014/015 supersede the next technical disposition.
- **Fallback:** Keep or restore the prior placeholder. If the approved
  immutable-preview/purge attempt fails, retain sanitized evidence and require
  a new finding disposition before another attempt.
- **Owner:** AU-AGENT-001 for the technical proposal; Project Owner for risk
  approval; AU-AGENT-003 for independent verification

## RISK-020 — Remote Preview Setting Drifts From Reviewed Configuration

- **Status:** Mitigation `[IMPLEMENTED]`, `[TESTED]`, exact-source engineering
  `VERIFIED`; live preflight `[TESTED]`; provider drift remains possible
- **Probability:** Observed
- **Impact:** High
- **Trigger:** The repository requires `workers_dev: false` and
  `preview_urls: true`, but the remote Worker has `enabled: true` and
  `previews_enabled: false`; Wrangler uploads a version but cannot provide the
  immutable preview URL required by the deployment contract.
- **Affected areas:** Pre-promotion verification, production attempt authority,
  auditability, orphaned zero-traffic versions, and delivery completion.
- **Prevention:** Treat exact remote state `enabled: false`,
  `previews_enabled: true` as an explicit owner-controlled prerequisite and
  query it before version upload. Preserve an upload-occurrence flag and
  sanitized version ID even when preview discovery fails.
- **Mitigation:** Run `30262328350` failed before preview smoke, promotion,
  purge, or traffic mutation. The prior version remained at 100 percent and
  independent GET/HEAD/hash checks retained the registered public baseline.
  OWNER-DEC-TS001-PRODUCTION-PREVIEW-003 establishes the exact remote state.
  The implementation now fails before upload on drift and retains sanitized
  version provenance after a successful upload.
- **Fallback:** Keep the prior production version. Do not repeat the workflow
  when the preflight fails. Run `30266185702` proved the exact remote state and
  proceeded; its later production-stability failure is tracked separately.
- **Owner:** Project Owner for remote setting and new attempt authority;
  AU-AGENT-001 for technical correction; AU-AGENT-003 for independent review

## RISK-021 — Promoted Static Asset Endpoint Is Not Stable Across Observations

- **Status:** Production observation confirmed in an isolated reproduction;
  remediation `[IMPLEMENTED]`, `[TESTED]` outside production; production
  continuation remains `REWORK REQUIRED`
- **Probability:** Observed in production once and repeatedly reproduced in the
  isolated deployment lab
- **Impact:** High
- **Trigger:** After exact immutable-preview verification, promotion, and
  hostname purge, the candidate root remains healthy while a required static
  endpoint such as `/version.json` returns a non-success response during the
  consecutive production quorum.
- **Affected areas:** Production provenance, static asset consistency,
  deployment completion, auditability, and safe release.
- **Evidence:** Run `30266185702`; candidate preview passed; production
  stability attempt 3 received `/version.json` `404`; TS001-DEPLOY-014 and
  TS001-DEPLOY-015; artifact `8652895888`; isolated
  baseline/candidate/version-affinity lab recorded in
  `CLOUDFLARE_DEPLOYMENT_TRANSITION_LAB_REPORT.md`.
- **Prevention:** Worker-owned immutable runtime provenance; exact-host
  IP-based Worker version affinity; per-request version identity; strict
  content-type and non-SPA asset assertions; bounded baseline-aware transition
  handling; three consecutive complete candidate contracts. Implemented and
  tested on the isolated branch, not yet production-reviewed or integrated.
- **Mitigation:** Preserve exact preview verification, fail-closed production
  quorum, immutable rollback, rollback purge, and baseline restoration. Extend
  sanitized retained evidence with bounded per-attempt/check identifiers.
- **Fallback:** Keep prior version `d1f2b05d` at 100 percent. Do not retry
  without exact-source independent review, required CI, protected merge,
  exact-main CI, and separate Project Owner authority.
- **Owner:** AU-AGENT-001 for technical alternative; AU-AGENT-003 for
  independent verification; Project Owner for any future attempt
