# Engineering Verification Report — <Task ID>

| Field | Value |
| --- | --- |
| Document ID | <stable report ID> |
| Title | Engineering Verification Report — <task title> |
| Status | `[PROPOSED]` |
| Owner | AU-AGENT-003 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 0.1.0 |
| Created | YYYY-MM-DD |
| Last Updated | YYYY-MM-DD |
| Dependencies | <Task Package, Technical Design, Completion Report, standards, ADRs> |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Source change; evidence change; finding remediation; requirement or standard change |

## Review Identity

- **Task ID and version:** <value>
- **Exact reviewed source:** <commit, range, artifact version, or checksums>
- **Implementation owner:** <registered agent or owner>
- **Reviewer:** AU-AGENT-003
- **Independence statement:** <why the reviewer did not implement the result>
- **Review scope:** <included areas>
- **Out of scope:** <excluded areas>
- **Documentation Impact:** <None | Minor | Material | Breaking>

## Inputs and Evidence

List the Task Package, Technical Design, implementation, test results,
documentation, Completion Report, traceability, ADRs, standards, environments,
commands, logs, benchmarks, screenshots, reports, and limitations actually
reviewed. Missing evidence is treated as missing implementation.

## Verification Checks

| Area | Evidence | Result | Limitations |
| --- | --- | --- | --- |
| Engineering quality | <reference> | <pass, fail, blocked, not applicable with reason> | <value> |
| Coding standards | <reference> | <value> | <value> |
| Architecture compliance | <reference> | <value> | <value> |
| Documentation completeness | <reference> | <value> | <value> |
| Testing completeness | <reference> | <value> | <value> |
| Regression coverage | <reference> | <value> | <value> |
| Security compliance | <reference> | <value> | <value> |
| CI/CD readiness | <reference> | <value> | <value> |
| Release readiness | <reference> | <value> | <value> |
| Traceability | <reference> | <value> | <value> |

## Findings

| Finding ID | Severity | Evidence | Requirement or Standard | Risk | Required Disposition | Owner | Reverification Condition | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <ID> | <Critical, High, Medium, Low, or Recommendation> | <reference> | <reference> | <value> | <value> | <owner> | <condition> | <open or resolved> |

Do not remove resolved findings. Append disposition and reverification evidence.
Critical findings block completion. Never downgrade severity without evidence.

## Risk Assessment

Describe residual engineering, regression, security, operational, release, and
evidence risks. Distinguish confirmed facts, derived conclusions, assumptions,
and unknowns.

## Documentation Review

Record documentation completeness, AU-AGENT-002 review evidence, traceability
updates, missing documentation, and any approved Documentation Exception.

## Quality Gate Decision

- **Engineering Verification Status:** <VERIFIED | VERIFIED WITH FINDINGS | REWORK REQUIRED | BLOCKED>
- **Decision rationale:** <evidence-based rationale>
- **Mandatory unresolved findings:** <IDs or None>
- **Completion Report blocked:** <Yes or No, with rule>
- **Required next action:** <owner and action>

The Engineering Verification Status is an unbracketed AU-AGENT-003 quality-gate
decision. It is not project `[VERIFIED]` and is not product acceptance.

## Limitations

State all review limitations, unavailable evidence, environmental constraints,
and claims that were not verified.

## References

- <Task Package>
- <Technical Design>
- <Completion Report>
- <applicable ADRs and standards>
- <evidence>
