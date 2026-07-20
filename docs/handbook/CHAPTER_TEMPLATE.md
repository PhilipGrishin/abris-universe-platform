# Engineering Handbook Chapter Template

| Field | Value |
| --- | --- |
| Document ID | AU-HB-TEMPLATE-001 |
| Title | Engineering Handbook Chapter Template |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/handbook/README.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Chapter structure requirement change; Documentation Standard change |

## Purpose

Provide the required structure for a future approved Handbook chapter without
supplying or inventing chapter content.

## Scope

Use only for tasks that have approved engineering sources, a content owner, and
a technical approver. Remove all instructional placeholders from the resulting
chapter.

## Required Chapter Metadata

```text
Document ID: <stable ID>
Title: <chapter title>
Status: <project status>
Owner: <document owner>
Technical Approver: <technical meaning owner>
Version: <document version>
Created: <YYYY-MM-DD>
Last Updated: <YYYY-MM-DD>
Dependencies: <canonical source links>
Supersedes: <document IDs or None>
Superseded By: <document IDs or None>
Review Triggers: <specific events>
Review Due: <only when a date is justified>
```

## Purpose

State why the chapter exists and which reader outcome it supports.

## Scope

State included and excluded knowledge. Identify canonical sources instead of
copying them.

## Definitions

Reference approved glossary terms and introduce no unapproved terminology.

## Engineering Principles

Explain applicable approved principles with links to their authority.

## Architecture

Explain approved architecture through references. Do not introduce a decision
or duplicate ADR and specification content.

## Constraints

List approved constraints and their sources.

## Common Mistakes

Describe evidence-backed mistakes, failure modes, or prohibited interpretations.

## Review Checklist

Provide chapter-specific checks linked to canonical requirements.

## References

List canonical sources, decisions, specifications, standards, and evidence.

## Owner

AU-AGENT-002 maintains this template. Chapter meaning is owned by its assigned
technical approver.

## Lifecycle

Update when the mandatory chapter contract changes. Existing chapters must
declare whether a new template version requires migration.

## Adding Documents

Create chapters through `docs/handbook/README.md`; do not copy this file and
publish it without replacing every placeholder and completing reviews.

## Related Sources

- [Handbook Index](README.md)
- [Source of Truth Registry](../SOURCE_OF_TRUTH.md)
- [Documentation Standard](../standards/DOCUMENTATION_STANDARD.md)
