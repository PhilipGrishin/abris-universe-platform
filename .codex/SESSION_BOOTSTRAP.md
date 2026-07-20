# Session Bootstrap

Complete this checklist before substantive work in every new session.

## Workspace and Git

- Determine the workspace or repository root.
- Run `git status --short --branch` if a Git repository exists.
- Record the current branch, uncommitted changes, and unfamiliar files.
- Do not initialize Git, discard changes, rewrite history, or move existing
  assets without project-owner authorization.

## Required Reading

Read in this order:

1. `AGENTS.md`
2. `.codex/PROJECT_INSTRUCTIONS.md`
3. `docs/SOURCE_OF_TRUTH.md`
4. `docs/README.md`
5. `docs/PROJECT_CONTEXT.md`
6. `docs/CURRENT_STATUS.md`
7. `.codex/CURRENT_FOCUS.md`
8. The latest entries in `docs/HANDOFF_LOG.md`
9. `docs/TASKS.md`
10. `docs/OPEN_QUESTIONS.md`
11. Recent entries in `docs/DECISIONS.md`
12. `docs/RISKS.md`
13. `docs/TECHNICAL_DEBT.md` if present
14. `docs/GLOSSARY.md` and `docs/TRACEABILITY_MATRIX.md` when terminology or
    traceability may be affected

## Implementation Evidence

- Inspect the relevant source, tests, schemas, configuration, dependencies, and
  migrations.
- Identify unfinished work and documentation/code conflicts.
- Run the documented baseline checks when executable code exists.
- Record confirmed facts, assumptions, unknowns, conflicts, and risks.
- State the active Task ID and version before beginning design or implementation.
- State Documentation Impact and affected canonical sources before changing
  maintained engineering knowledge.

## Current Bootstrap Limitation

`[OPEN]` This workspace does not yet contain a Git repository, application code,
or build/test commands. Until that changes, bootstrap verification is limited to
documentation consistency and filesystem inspection.
