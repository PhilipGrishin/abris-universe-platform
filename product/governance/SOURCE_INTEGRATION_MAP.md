# Claude Product Source Integration Map

| Field | Value |
| --- | --- |
| Document ID | AU-PROD-INTEGRATION-001 |
| Title | Claude Product Source Integration Map |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `product/README.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | External source change; re-import; source status change; checksum mismatch; authority conflict |

## Purpose

Record the controlled, file-by-file disposition of the read-only Claude Cowork
workspace used for the initial shared-repository integration.

## Scope and Audit Basis

The source workspace contained 18 files and was not a Git repository at audit
time. Seventeen source files were imported. `.DS_Store` was excluded. SHA-256
values below identify the source files before import. Imported Markdown also
received non-semantic trailing-whitespace and final-newline normalization;
additional content differences are recorded in the Notes column.

## File Classification

| External source file | Classification | Repository destination | Source SHA-256 | Notes |
| --- | --- | --- | --- | --- |
| `.DS_Store` | local-only; exclude | None | `f8c9a9aae3f4760aa5908499918e2699136de61f30419b7d204bbf4858afc66b` | Finder metadata; ignored by `.gitignore`. |
| `README.md` | import as product governance | `product/governance/CLAUDE_COWORK_PROJECT_INSTRUCTIONS.md` | `a31acd26749a739e35a08f22c515ef24ca83cf5ea44aa95f1d0d732108d9d9f5` | Added authority note; normalized local paths and obsolete environment-specific launch instruction. |
| `Abris_Universe_Master_Product_Specification_RU.docx` | import as canonical product source | `product/specifications/Abris_Universe_Master_Product_Specification_RU.docx` | `27d9683e3203025d37ed0acc925b30d62e58bb653eece5880d8b86234c685402` | Approved v1.0; only intentional binary in the initial product contour. |
| `00_GOVERNANCE/05_Decision_Log.md` | import as canonical product decisions | `product/decisions/05_Decision_Log.md` | `dfabf0e7ddf3dcb957b589961e28cf4efcb7e535ba7c28dad7774e6c7e53279b` | Business email replaced with role identifier; decision meaning preserved. |
| `00_GOVERNANCE/06_Documentation_Structure.md` | superseded; import as historical reference | `product/archive/06_Documentation_Structure.md` | `eb4083ee915f291400b878d0ff3279c86beaedfdfceef6205f12ec947d98ecd7` | Old physical layout superseded by `product/README.md`; paths normalized. |
| `00_GOVERNANCE/08_Critical_Review_Report.md` | import as historical review evidence | `product/reviews/08_Critical_Review_Report.md` | `f0c847ac2d14d506873859a7a8ee0448290935985b326db37281df488fcdf988` | Historical ephemeral paths normalized. |
| `01_PRODUCT/01_Product_Vision_and_Roadmap.md` | requires owner review; import as draft product specification | `product/specifications/01_Product_Vision_and_Roadmap.md` | `f91638dd5e960d23b983ca62b9c151e4970f2d96c46b311281e4139194f44a3e` | Source status remains draft. |
| `02_RESEARCH/03_Deep_Research_Standards.md` | import as research evidence | `product/research/03_Deep_Research_Standards.md` | `60d8cbf68d019851f0bf8950411c16ec47cd612d1ca92a9cb287c870c622e146` | Not a product or architecture decision. |
| `04_ARCHITECTURE/02_Architecture_and_Stack.md` | requires engineering review; import as product-side proposal | `product/architecture-inputs/02_Architecture_and_Stack.md` | `6b622d562456e57e3fa79f653745bcf474bb99d000f5b01f3bf32909634bf65a` | Authority note added; stack and ADRs remain proposed. |
| `07_CODEX_HANDOFF/04_Codex_Context_Pack.md` | import as product governance/navigation | `product/governance/04_Codex_Context_Pack.md` | `9fd2f9bcadf97297b4a86c2c6d9ddee9cbd20103c120f19a4543521eb7bf467b` | Context only; does not redefine product requirements. |
| `07_CODEX_HANDOFF/07_TaskPackage_EP01_ThinSlice.md` | import as canonical versioned Task Package | `product/task-packages/07_TaskPackage_EP01_ThinSlice.md` | `84010c491ec7d8afd8ef79b4814f20786ed7dfd387fe804e09f0b45c2cc52257` | Approved for Codex review; intake note records inactive specialist dependency. |
| `agents/delivery-documentation-codex-coordination-lead.md` | import as product governance | `product/agents/definitions/delivery-documentation-codex-coordination-lead.md` | `febf52cfe0a53a17f370439bcea81b6b37113e2fc476281119417d681e1a8352` | Active Claude specialized role source. |
| `agents/ecosystem-community-commercial-product-lead.md` | import as product governance | `product/agents/definitions/ecosystem-community-commercial-product-lead.md` | `80b21fed1bdf7cfc04da9db52db63462ddde39a4af39077eda197979927e9024` | Active Claude specialized role source. |
| `agents/embroidery-domain-ux-lead.md` | import as product governance | `product/agents/definitions/embroidery-domain-ux-lead.md` | `ce3df9cbb20d791c75be7364dae88da20012a2b69a1f0f30b97e7d13c0b7fbd5` | Active Claude specialized role source. |
| `agents/product-strategy-requirements-lead.md` | import as product governance | `product/agents/definitions/product-strategy-requirements-lead.md` | `ee81fd1ec14f7a6f631d629aff5afb230c6a583e290fe820f3266b3ad43a3bf0` | Active Claude specialized role source. |
| `agents/quality-security-independent-acceptance-lead.md` | import as product governance | `product/agents/definitions/quality-security-independent-acceptance-lead.md` | `19dfe94350b3334a31de658aaf11ab6cffc870337dc912eacff788eb082cf09f` | Active independent Claude review role source. |
| `agents/research-product-analytics-lead.md` | import as product governance | `product/agents/definitions/research-product-analytics-lead.md` | `92f93d6c8be199d17bde08958f760f31838828b83e08daf91c9e8bcd53fe1c84` | Active Claude specialized role source. |
| `agents/system-architecture-data-ai-governance-lead.md` | import as product governance | `product/agents/definitions/system-architecture-data-ai-governance-lead.md` | `367e242f907f3fc34d9278f4ca44d7310bc79b9aacafc9fda8fa38d1c5da5e01` | Active Claude specialized role source. |

## Duplication and Supersession Findings

No exact duplicate source files were found. The Context Pack, Product Vision,
and architecture input summarize or interpret the Master Specification, but
their declared statuses and this registry prevent them from replacing it. The
legacy documentation-structure file is explicitly superseded for physical
navigation and retained in the archive for provenance.

## Security and Local-Only Findings

No credential, token, private-key, or embedded-authentication signature was
found in selected Markdown files or the internal XML and relationships of the
Master Specification. One business email was minimized in the repository copy.
No `.env`, logs, swap files, backups, or other temporary files were present.

## Owner

AU-AGENT-002 maintains mappings, provenance, checksums, navigation, and
lifecycle. Product owners approve product meaning and classification.

## Lifecycle and Re-import

Re-audit the external workspace before any later import. Compare source
checksums, classify additions and changes, preserve history, and require owner
review before changing canonical product authority.

## Related Sources

- `product/README.md`
- `docs/SOURCE_OF_TRUTH.md`
- `product/governance/README.md`
- `product/archive/README.md`
