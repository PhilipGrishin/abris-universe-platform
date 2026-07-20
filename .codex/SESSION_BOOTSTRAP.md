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

1. `PROJECT_MANIFEST.md`
2. `docs/SOURCE_OF_TRUTH.md`
3. `AGENTS.md`
4. `.codex/PROJECT_INSTRUCTIONS.md`
5. `product/README.md` and the exact Task Package when product scope applies
6. `docs/README.md`
7. `docs/PROJECT_CONTEXT.md`
8. `docs/CURRENT_STATUS.md`
9. `.codex/CURRENT_FOCUS.md`
10. The latest entries in `docs/HANDOFF_LOG.md`
11. `docs/TASKS.md`
12. `docs/OPEN_QUESTIONS.md`
13. Recent entries in `docs/DECISIONS.md`
14. `docs/RISKS.md`
15. `docs/TECHNICAL_DEBT.md` if present
16. `docs/GLOSSARY.md` and `docs/TRACEABILITY_MATRIX.md` when terminology or
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

`[OPEN]` The repository exists, but it does not yet contain application code or
build/test commands. Until implementation begins through an approved Technical
Design, executable verification is limited to Git, source, documentation, and
repository consistency.
