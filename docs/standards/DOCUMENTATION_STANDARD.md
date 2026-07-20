# Engineering Documentation Standard

| Field | Value |
| --- | --- |
| Document ID | AU-STD-DOC-001 |
| Title | Engineering Documentation Standard |
| Status | `[APPROVED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `AGENTS.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Documentation governance change; lifecycle defect; recurring review failure; source hierarchy change |

## Purpose

Define the mandatory structure, lifecycle, quality controls, and impact workflow
for maintained Abris Universe engineering documentation.

## Scope

Applies to the Engineering Handbook, architecture documents, ADRs, RFCs,
specifications, glossary entries, traceability records, engineering standards,
threat models, capability matrices, review checklists, migration documents,
benchmark documents, indexes, and Documentation Review Reports.

## Ownership Model

- AU-CODEX-PRIMARY owns governance, source hierarchy, and organizational rules.
- AU-AGENT-001 and assigned domain agents own technical meaning and engineering
  correctness.
- AU-AGENT-002 owns structure, navigation, consistency, terminology,
  traceability, reviewability, auditability, and lifecycle.
- Product meaning remains with the project owner and Claude Cowork sources.

AU-AGENT-002 must not independently change technical architecture, product
behavior, approved terminology, or implementation meaning.

## Required Metadata

Every managed document must declare:

- Document ID
- Title
- Status
- Owner
- Technical Approver
- Version
- Created
- Last Updated
- Dependencies
- Supersedes
- Superseded By
- Review Triggers

Add `Review Due` only when a concrete date is justified by an external
commitment, scheduled control, deprecation, release, regulation, or explicit
owner decision. Do not invent review dates.

## Status and Versioning

Use the project status vocabulary. `[IMPLEMENTED]`, `[TESTED]`, and `[VERIFIED]`
remain distinct. AU-AGENT-002 cannot independently assign `[VERIFIED]`.

Document versions use semantic intent:

- Major: changes approved meaning, authority, contract, or required structure.
- Minor: adds substantive approved knowledge without invalidating existing use.
- Patch: fixes navigation, formatting, metadata, or wording without changing
  meaning.

Version changes never replace approval evidence.

## Documentation Lifecycle

1. **Identify:** Record Documentation Impact and affected canonical sources.
2. **Draft:** Create or update content from approved engineering knowledge.
3. **Content review:** Technical or product owner validates meaning.
4. **Documentation review:** AU-AGENT-002 validates structure, links,
   terminology, traceability, duplication, and metadata.
5. **Integrate:** Update indexes, glossary, references, traceability, and current
   state.
6. **Validate:** Check links, orphan status, source conflicts, and required
   metadata.
7. **Publish:** Record status and evidence in the Completion Report and handoff.
8. **Maintain:** Review on declared triggers; supersede without silent deletion.

## Documentation Impact

Every Task Package or equivalent task record, Technical Design Proposal,
Technical Review, and Completion Report must contain `Documentation Impact`.

- **None:** No engineering knowledge, behavior, contract, architecture,
  operation, terminology, source authority, or maintained document changes. A
  short rationale is required.
- **Minor:** A localized clarification, index, reference, example, or wording
  update that does not change canonical technical or product meaning.
- **Material:** New or changed approved engineering knowledge, architecture
  explanation, contract, specification, standard, workflow, operational rule,
  terminology, assurance evidence, or cross-document traceability.
- **Breaking:** A change that supersedes or invalidates a canonical decision,
  contract, schema, migration/recovery rule, source authority, terminology, or
  documentation structure used by other documents or agents.

If impact is not `None`, the task cannot be completed without either:

1. the required documentation result and AU-AGENT-002 review; or
2. a registered Documentation Exception.

## Documentation Exception

An exception must record:

- Exception ID
- Task ID and requirement version
- Documentation Impact
- Missing documentation result
- Reason and evidence
- Affected sources and consumers
- Risk
- Temporary mitigation
- Owner
- Approval
- Resolution trigger or justified due date
- Status

Exceptions are indexed under `docs/reviews/documentation/` and referenced by the
task, current status, and Completion Report. An exception does not permit an
undocumented breaking change unless the relevant technical and project owners
explicitly approve the risk.

## Single Source of Truth Rules

- Register canonical source classes in `docs/SOURCE_OF_TRUTH.md`.
- Reference definitions instead of copying them.
- Use indexes for navigation, not as alternate specifications.
- A glossary records approved terms and points to their authority.
- Traceability maps sources but does not redefine them.
- Review reports identify defects but do not silently repair meaning.

## Engineering Handbook Rules

The Handbook:

- explains the system and connects canonical sources;
- does not duplicate ADRs, RFCs, specifications, architecture documents, or
  product decisions;
- uses references instead of redefining technical facts;
- is created only from approved engineering knowledge;
- is not an authority for a duplicated fact when a canonical source exists.

Every future chapter must contain Purpose, Scope, Definitions, Engineering
Principles, Architecture, Constraints, Common Mistakes, Review Checklist, and
References.

## Documentation Quality Controls

Continuously check for:

- duplicated or conflicting content;
- broken or circular navigation;
- outdated or inconsistent terminology;
- missing glossary entries;
- missing ADR, RFC, specification, or source references;
- missing review checklists and traceability;
- missing metadata;
- orphan or dead documents;
- silent supersession or deletion;
- unsupported claims and invented architecture.

Record defects in a Documentation Review Report. Poor documentation is an
engineering defect, but AU-AGENT-002 must route substantive corrections to the
content owner.

## AI-Generated Documentation

External Architecture AI output is draft input, never automatic source truth.
AU-AGENT-002 integrates it only after content-owner approval, then updates
indexes, glossary, references, traceability, and release state. AI output must
not silently simplify or change engineering meaning.

## Validation Gate

Before documentation work is complete:

- all local links resolve;
- required metadata is present;
- the document appears in the correct index;
- no conflicting canonical source was introduced;
- glossary and traceability impact was evaluated;
- technical meaning was reviewed by the correct owner;
- documentation review evidence is recorded;
- `[VERIFIED]` is assigned only by an independent authority.

## Related Sources

- `docs/SOURCE_OF_TRUTH.md`
- `docs/README.md`
- `docs/GLOSSARY.md`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/reviews/documentation/README.md`
