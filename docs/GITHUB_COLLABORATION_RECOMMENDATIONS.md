# GitHub Collaboration Recommendations

| Field | Value |
| --- | --- |
| Document ID | AU-GOV-GITHUB-PROPOSAL-001 |
| Title | GitHub Collaboration Recommendations |
| Status | `[PROPOSED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SHARED_WORKFLOW.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Collaboration approval; GitHub capability change; security policy; CI/CD design |

## Purpose

Propose a reviewable GitHub collaboration baseline without enabling automation,
changing repository settings, or creating credentials.

## Scope

Recommendations cover branch protection, pull requests, Issues, labels,
artifact routing, review outcomes, documentation validation, and secret
scanning. They do not define CI/CD or agent API automation.

## Recommended Branch Protection

- Protect `main` after the bootstrap is independently reviewed.
- Require pull requests for subsequent substantive changes.
- Require at least one approval from an authority appropriate to the change.
- Require conversations to be resolved and configured checks to pass.
- Block force pushes and branch deletion.
- Apply the rule to administrators unless the Project Owner approves an
  emergency procedure with audit evidence.

Exact settings and account-plan availability must be verified immediately
before configuration.

## Recommended Pull Request Workflow

- Use a task-scoped branch tied to a Task Package, governance task, or defect.
- State product source version, Documentation Impact, affected contours,
  evidence, risks, rollback, and reviewer authority.
- Do not use a product reviewer as the sole technical approver or an
  implementation author as the independent acceptance authority.

## Recommended Issues and Labels

Use Issues only after the owner approves the intake model. Proposed label
families:

- `area:product`, `area:engineering`, `area:documentation`
- `type:task-package`, `type:clarification`, `type:conflict`, `type:defect`
- `stage:codex-review`, `stage:implementation`, `stage:claude-review`
- `outcome:verified`, `outcome:rework-required`
- `impact:none`, `impact:minor`, `impact:material`, `impact:breaking`

Labels are navigation aids and never replace canonical artifact status.

## Recommended Validation Automation

After separate approval, add narrowly scoped checks for Markdown links,
required metadata, source-index consistency, accidental binaries, secret
signatures, and later implementation tests. Select CI/CD only after the
technology stack and security model are approved.

## Agent Automation Boundary

Do not create Claude or Codex API automation until credentials, permissions,
write scope, audit logging, failure handling, cost controls, and human approval
gates are separately decided. Start read-only where possible.

## Owner, Lifecycle, and Approval

AU-CODEX-PRIMARY maintains this proposal; the Project Owner approves GitHub
governance changes. Once settings are approved and implemented, record evidence
without rewriting this proposal as if it had always been active.

## Related Sources

- `docs/SHARED_WORKFLOW.md`
- `PROJECT_MANIFEST.md`
- `docs/SOURCE_OF_TRUTH.md`
- `docs/RISKS.md`
