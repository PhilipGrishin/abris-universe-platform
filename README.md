# Abris Universe

Start with the [Platform Manifest](PROJECT_MANIFEST.md). It is the shared,
tool-neutral navigation layer for the product and engineering contours.

Abris Universe is a planned digital ecosystem for cross-stitch, beadwork, and
related crafts. The confirmed product vision includes pattern viewing and
tracking, pattern import and conversion, offline progress, synchronization,
creator and community capabilities, education, analytics, and future ecosystem
services.

## Current Stage

`[IMPLEMENTED]` The technical governance workspace has been initialized.

`[IMPLEMENTED]` The first specialist role, Lead Software Architect & Development
Orchestrator, has been registered and its initial repository and architecture
assessment is documented.

`[IMPLEMENTED]` AU-AGENT-002, Engineering Documentation Manager, and the scalable
engineering documentation governance infrastructure are registered.

`[IMPLEMENTED]` The private shared platform repository, product contour, Claude
Cowork organization registry, and shared product-to-engineering workflow are
present.

`[IMPLEMENTED]`, `[TESTED]` The approved non-behavioral pnpm workspace
scaffold and project-original OXS route-1 fixture suite are present.

`[IMPLEMENTED]`, `[TESTED]` The framework-independent canonical `domain-core`
contracts and invariant tests are present.

`[OPEN]` No executable application or user-facing product capability is
present. The current Technical Design remains `[PROPOSED]` with registered
evidence gates.

## Start Here

1. Read the [Platform Manifest](PROJECT_MANIFEST.md).
2. Read the [Source of Truth Registry](docs/SOURCE_OF_TRUTH.md).
3. Select the [Product Contour](product/README.md) or
   [Engineering Documentation Home](docs/README.md).
4. Read [Project Context](docs/PROJECT_CONTEXT.md) and
   [Current Status](docs/CURRENT_STATUS.md).
5. Follow [Session Bootstrap](.codex/SESSION_BOOTSTRAP.md).
6. Check [Current Focus](.codex/CURRENT_FOCUS.md) and [Tasks](docs/TASKS.md).
7. Resolve relevant [Open Questions](docs/OPEN_QUESTIONS.md) before making
   irreversible decisions.

## Running and Testing

There is no executable application yet. The current checks validate fixture
determinism, workspace boundaries, and canonical-domain contracts:

```bash
pnpm test
pnpm typecheck
pnpm run verify:fixtures
pnpm run verify:workspace
```

Build, run, lint, migration, and deployment commands remain absent until their
implementation stages.

## Documentation

- [Engineering Documentation Home](docs/README.md)
- [Product Contour](product/README.md)
- [Shared AI Organization](AI_ORGANIZATION.md)
- [Shared Product-to-Engineering Workflow](docs/SHARED_WORKFLOW.md)
- [Source of Truth Registry](docs/SOURCE_OF_TRUTH.md)
- [Workspace Audit](docs/WORKSPACE_AUDIT.md)
- [Architecture and Repository Assessment](docs/ARCHITECTURE.md)
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Agent Model](docs/CODEX_AGENTS.md)
- [Technical Decisions](docs/DECISIONS.md)
- [Technical Risks](docs/RISKS.md)
- [Handoff Log](docs/HANDOFF_LOG.md)
- [OXS Route-1 Fixtures](tests/fixtures/oxs/README.md)

The documentation intentionally does not invent product architecture, data
models, API contracts, internal pattern formats, security controls, performance
targets, or release plans before their inputs are available.
