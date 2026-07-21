# Local Claude-Codex Collaboration Bridge

| Field | Value |
| --- | --- |
| Document ID | AU-COLLAB-INDEX-001 |
| Title | Local Claude-Codex Collaboration Bridge |
| Status | `[IMPLEMENTED]`, not `[VERIFIED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-21 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/SHARED_WORKFLOW.md`, `AI_ORGANIZATION.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Direct Claude repository access; exchange contract change; security finding; synchronization failure; automation approval |

## Purpose

Provide a controlled local exchange between Claude Cowork and Codex when Claude
cannot access GitHub directly. GitHub remains canonical. Codex is the sole Git
operator and repository writer for Claude-produced artifacts.

## Scope

This infrastructure governs local task and review transport, validation,
staging, status, and archival. It does not define product requirements,
technical architecture, implementation behavior, or independent acceptance.

## Selected Topology

`[APPROVED]` Option B uses a synchronized external bridge because reliable
Claude access to the engineering repository is not confirmed, while the
external Claude workspace is its established local working environment.

Portable repository configuration never contains the external absolute path.
The path is stored only in `.collaboration-bridge.local.json`, which is ignored
by Git.

## Authority

- Claude Cowork owns product meaning within its approved authority, reads only
  supplied packages, and writes only to its designated external outbox.
- Claude Cowork does not commit, push, merge, or directly change canonical
  repository state.
- Codex prepares packages, validates returns, preserves Claude-authored meaning,
  stages approved outputs, updates traceability, and performs Git operations.
- AU-AGENT-002 owns placement, navigation, metadata, lifecycle, and traceability.
- AU-AGENT-001 reviews technical implications when applicable.

## Repository Boundaries

```text
collaboration/
|-- claude/
|   |-- inbox/        local transient export mirror, Git-ignored
|   |-- outbox/       local transient return mirror, Git-ignored
|   `-- archive/      local transient exchange archive, Git-ignored
|-- codex/
|   |-- inbox/        validated return staging, Git-ignored
|   |-- outbox/       Codex transient delivery staging, Git-ignored
|   `-- archive/      Codex transient archive, Git-ignored
|-- manifests/        committed exchange records and provenance
|-- schemas/          committed machine-readable contracts
|-- scripts/          committed local tooling
`-- runtime/          generated packages, Git-ignored
```

`.gitkeep` files preserve empty transient boundaries only. They contain no task
payload and are the sole committed files allowed in those directories.

## Canonical Twelve-Step Exchange Lifecycle

1. Codex identifies the required Claude task.
2. Codex prepares a versioned exchange package.
3. The package references an exact Git commit.
4. Claude reads only the supplied package and approved source files.
5. Claude writes results to its outbox.
6. Codex validates the return package.
7. The technical or product owner reviews findings where required.
8. AU-AGENT-002 selects canonical document placement.
9. Codex creates a branch and integrates the result.
10. Codex creates a commit or pull request.
11. The exchange is archived with provenance.
12. The Traceability Matrix and status records are updated.

Preparation includes source-authority, freshness, safety, and checksum checks.
Import enters ignored staging only; steps 7–10 are separate authorized actions.
Archival requires an explicit review reference.

## Safety Invariants

- Every task references one exact Git commit and branch.
- Every included and returned file has a SHA-256 checksum.
- Paths must be portable, relative, normalized, and confined to their package.
- Symlinks, hidden output files, temporary files, unexpected binaries, secrets,
  machine-local paths, oversized files, duplicate Exchange IDs, stale source
  commits, checksum mismatches, unregistered outputs, and unsupported statuses
  fail validation.
- Failed outputs are never staged automatically.
- No script commits, pushes, merges, or modifies canonical product files.
- Commands that write, synchronize, import, or archive default to dry-run and
  require `--apply`.

## Navigation

- [Script Usage](scripts/README.md)
- [Exchange Manifest Registry](manifests/README.md)
- [Task Manifest Schema](schemas/claude-task-manifest.schema.json)
- [Return Manifest Schema](schemas/claude-return-manifest.schema.json)
- [Shared Product-to-Engineering Workflow](../docs/SHARED_WORKFLOW.md)
- [Source of Truth Registry](../docs/SOURCE_OF_TRUTH.md)

## Lifecycle and Adding Exchanges

Create a stable Exchange ID, select an allowed task type, identify exact source
commit and role authority, declare Documentation Impact, include only necessary
sources, and preserve the final manifest and outcome record. Never reuse an
Exchange ID.
