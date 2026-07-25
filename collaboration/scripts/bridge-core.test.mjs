import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import {
  assertNoSymlinkPath,
  assertPortableRelativePath,
  assertSourceIsCurrent,
  assertUniqueExchangeId,
  ensureAllowedExtension,
  inspectTextSafety,
  sha256,
  validateArchiveRecord,
  validateClaudeReturn,
  validateExchangeOutcome,
  validateReturnManifest,
  validateTaskManifest,
  validateTextFile,
} from "./lib/bridge-core.mjs";

function expectCode(callback, code) {
  assert.throws(callback, (error) => error?.code === code);
}

test("rejects path traversal", () => {
  expectCode(() => assertPortableRelativePath("../outside.md"), "PATH_TRAVERSAL");
});

test("rejects hidden output paths", () => {
  expectCode(() => assertPortableRelativePath("outputs/.hidden.md"), "HIDDEN_FILE");
});

test("rejects absolute paths and temporary files", () => {
  expectCode(() => assertPortableRelativePath("/tmp/report.md"), "ABSOLUTE_PATH");
  expectCode(() => assertPortableRelativePath("outputs/report.tmp"), "TEMPORARY_FILE");
  expectCode(() => assertPortableRelativePath("outputs/.DS_Store"), "HIDDEN_FILE");
});

test("rejects symbolic links", () => {
  const root = mkdtempSync(join(tmpdir(), "au-bridge-symlink-"));
  writeFileSync(join(root, "target.md"), "safe\n");
  symlinkSync(join(root, "target.md"), join(root, "linked.md"));
  expectCode(() => assertNoSymlinkPath(root, "linked.md"), "SYMLINK");
});

test("detects likely secrets", () => {
  const credential = ["gh", "p_", "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456"].join("");
  expectCode(() => inspectTextSafety(`token=${credential}`, "sample"), "POTENTIAL_SECRET");
});

test("detects machine-specific absolute paths", () => {
  const machinePath = ["", "Users", "example", "private", "file.md"].join("/");
  expectCode(() => inspectTextSafety(`See ${machinePath}`, "sample"), "MACHINE_PATH");
});

test("rejects unexpected output extensions", () => {
  expectCode(() => ensureAllowedExtension("payload.exe", [".md"]), "UNEXPECTED_EXTENSION");
});

test("rejects binary and oversized files", () => {
  const root = mkdtempSync(join(tmpdir(), "au-bridge-file-"));
  const binary = join(root, "binary.dat");
  writeFileSync(binary, Buffer.from([0, 1, 2, 3]));
  expectCode(() => validateTextFile(binary, "binary.dat"), "BINARY_FILE");
  const large = join(root, "large.md");
  writeFileSync(large, "12345");
  expectCode(() => validateTextFile(large, "large.md", { maxFileSizeBytes: 4 }), "FILE_TOO_LARGE");
});

test("rejects duplicate exchange identifiers", () => {
  const root = mkdtempSync(join(tmpdir(), "au-bridge-duplicate-"));
  const manifests = join(root, "collaboration", "manifests");
  const first = join(manifests, "first");
  const second = join(manifests, "second");
  mkdirSync(first, { recursive: true });
  mkdirSync(second, { recursive: true });
  writeFileSync(join(first, "request.json"), JSON.stringify({ exchange_id: "AU-EX-DUPLICATE" }));
  writeFileSync(join(second, "request.json"), JSON.stringify({ exchange_id: "AU-EX-DUPLICATE" }));
  expectCode(() => assertUniqueExchangeId(root, "AU-EX-DUPLICATE", join(first, "task-manifest.json")), "DUPLICATE_EXCHANGE_ID");
});

test("rejects stale source commits", () => {
  const root = mkdtempSync(join(tmpdir(), "au-bridge-stale-"));
  execFileSync("git", ["init", "-b", "main"], { cwd: root, stdio: "ignore" });
  writeFileSync(join(root, "source.md"), "one\n");
  execFileSync("git", ["add", "source.md"], { cwd: root });
  execFileSync("git", ["-c", "user.name=Bridge Test", "-c", "user.email=bridge@example.invalid", "commit", "-m", "one"], { cwd: root, stdio: "ignore" });
  const first = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  writeFileSync(join(root, "source.md"), "two\n");
  execFileSync("git", ["add", "source.md"], { cwd: root });
  execFileSync("git", ["-c", "user.name=Bridge Test", "-c", "user.email=bridge@example.invalid", "commit", "-m", "two"], { cwd: root, stdio: "ignore" });
  expectCode(() => assertSourceIsCurrent(root, { source_branch: "main", source_commit_sha: first }), "STALE_SOURCE_COMMIT");
});

test("rejects task manifests whose required inputs are not packaged", () => {
  const included = { path: "sources/present.md", sha256: "a".repeat(64), size_bytes: 1 };
  expectCode(() => validateTaskManifest({
    schema_version: "1.0.0",
    exchange_id: "AU-EX-MISSING-INPUT",
    task_id: "TASK-MISSING-INPUT",
    task_type: "PRODUCT_DECISION",
    requested_claude_role: "Chief Project Orchestrator",
    source_commit_sha: "b".repeat(40),
    source_branch: "codex/test",
    prepared_at: "2026-07-25T00:00:00Z",
    prepared_by: "AU-CODEX-PRIMARY",
    purpose: "Validate required package inputs.",
    scope: ["Validate input registration."],
    out_of_scope: ["No integration."],
    required_inputs: ["sources/missing.md"],
    included_files: [included],
    expected_outputs: ["return-manifest.json"],
    acceptance_criteria: ["Every required input exists."],
    authority_boundaries: {
      product_authority: "Product owner.",
      engineering_authority: "Engineering owner.",
      documentation_authority: "Documentation owner.",
      git_authority: "Git owner."
    },
    documentation_impact: "Minor",
    return_location: "claude/outbox/AU-EX-MISSING-INPUT",
    allowed_output_extensions: [".md", ".json"],
    integrity_checksums: { [included.path]: included.sha256 },
  }), "MISSING_REQUIRED_INPUT");
});

test("requires an explicit independent acceptance decision", () => {
  const record = { path: "acceptance-report.md", sha256: "a".repeat(64), size_bytes: 1 };
  expectCode(() => validateReturnManifest({
    schema_version: "1.0.0",
    exchange_id: "AU-EX-TEST-001",
    source_task_id: "TASK-001",
    claude_role: "Independent Reviewer",
    result_type: "INDEPENDENT_ACCEPTANCE_REVIEW",
    result_status: "COMPLETED",
    created_at: "2026-07-21T00:00:00Z",
    reviewed_sources: [{ path: "sources/input.md", sha256: "b".repeat(64), size_bytes: 1 }],
    findings: [],
    blocking_findings: [],
    non_blocking_findings: [],
    decision: "NO_DECISION",
    required_rework: [],
    open_questions: [],
    output_files: [record],
    checksums: { "acceptance-report.md": record.sha256 },
    product_authority_statement: "No product decision was changed.",
    limitations: [],
  }), "AMBIGUOUS_ACCEPTANCE_DECISION");
});

test("rejects unsupported result statuses", () => {
  const record = { path: "acceptance-report.md", sha256: "a".repeat(64), size_bytes: 1 };
  expectCode(() => validateReturnManifest({
    schema_version: "1.0.0", exchange_id: "AU-EX-TEST-STATUS", source_task_id: "TASK-STATUS",
    claude_role: "Independent Reviewer", result_type: "INDEPENDENT_ACCEPTANCE_REVIEW",
    result_status: "APPROVED", created_at: "2026-07-21T00:00:00Z",
    reviewed_sources: [{ path: "sources/input.md", sha256: "b".repeat(64), size_bytes: 1 }],
    findings: [], blocking_findings: [], non_blocking_findings: [], decision: "VERIFIED",
    required_rework: [], open_questions: [], output_files: [record],
    checksums: { "acceptance-report.md": record.sha256 },
    product_authority_statement: "No product decision was changed.", limitations: [],
  }), "MANIFEST_SCHEMA");
});

test("rejects unregistered output files", () => {
  const root = mkdtempSync(join(tmpdir(), "au-bridge-unregistered-"));
  mkdirSync(join(root, "outputs"));
  const report = Buffer.from("review\n");
  writeFileSync(join(root, "outputs", "acceptance-report.md"), report);
  writeFileSync(join(root, "outputs", "extra.md"), "unregistered\n");
  const source = { path: "sources/input.md", sha256: "b".repeat(64), size_bytes: 1 };
  const output = { path: "acceptance-report.md", sha256: sha256(report), size_bytes: report.length };
  writeFileSync(join(root, "return-manifest.json"), JSON.stringify({
    schema_version: "1.0.0",
    exchange_id: "AU-EX-TEST-002",
    source_task_id: "TASK-002",
    claude_role: "Independent Reviewer",
    result_type: "INDEPENDENT_ACCEPTANCE_REVIEW",
    result_status: "COMPLETED",
    created_at: "2026-07-21T00:00:00Z",
    reviewed_sources: [source],
    findings: [], blocking_findings: [], non_blocking_findings: [],
    decision: "VERIFIED", required_rework: [], open_questions: [],
    output_files: [output],
    checksums: { "acceptance-report.md": output.sha256 },
    product_authority_statement: "No product decision was changed.",
    limitations: [],
  }));
  expectCode(() => validateClaudeReturn({
    outputRoot: root,
    taskManifest: {
      exchange_id: "AU-EX-TEST-002", task_id: "TASK-002", requested_claude_role: "Independent Reviewer",
      task_type: "INDEPENDENT_ACCEPTANCE_REVIEW", included_files: [source], required_inputs: [source.path],
      allowed_output_extensions: [".md"],
    },
  }), "UNREGISTERED_OUTPUT_FILE");
});

test("rejects output checksum mismatches", () => {
  const root = mkdtempSync(join(tmpdir(), "au-bridge-checksum-"));
  mkdirSync(join(root, "outputs"));
  const report = Buffer.from("review\n");
  writeFileSync(join(root, "outputs", "acceptance-report.md"), report);
  const source = { path: "sources/input.md", sha256: "b".repeat(64), size_bytes: 1 };
  const output = { path: "acceptance-report.md", sha256: "c".repeat(64), size_bytes: report.length };
  writeFileSync(join(root, "return-manifest.json"), JSON.stringify({
    schema_version: "1.0.0",
    exchange_id: "AU-EX-TEST-003",
    source_task_id: "TASK-003",
    claude_role: "Independent Reviewer",
    result_type: "INDEPENDENT_ACCEPTANCE_REVIEW",
    result_status: "COMPLETED",
    created_at: "2026-07-21T00:00:00Z",
    reviewed_sources: [source],
    findings: [], blocking_findings: [], non_blocking_findings: [],
    decision: "VERIFIED", required_rework: [], open_questions: [],
    output_files: [output],
    checksums: { "acceptance-report.md": output.sha256 },
    product_authority_statement: "No product decision was changed.",
    limitations: [],
  }));
  expectCode(() => validateClaudeReturn({
    outputRoot: root,
    taskManifest: {
      exchange_id: "AU-EX-TEST-003", task_id: "TASK-003", requested_claude_role: "Independent Reviewer",
      task_type: "INDEPENDENT_ACCEPTANCE_REVIEW", included_files: [source], required_inputs: [source.path],
      allowed_output_extensions: [".md"],
    },
  }), "CHECKSUM_MISMATCH");
});

test("validates archive records against returned status and decision", () => {
  const returnManifest = { result_status: "COMPLETED", decision: "VERIFIED" };
  const archiveRecord = {
    schema_version: "1.0.0",
    exchange_id: "AU-EX-ARCHIVE-001",
    archived_at: "2026-07-25T00:00:00Z",
    archived_by: "AU-CODEX-PRIMARY",
    review_reference: "product/reviews/report.md",
    result_status: "COMPLETED",
    decision: "VERIFIED",
  };
  assert.equal(validateArchiveRecord(archiveRecord, {
    exchangeId: "AU-EX-ARCHIVE-001",
    returnManifest,
  }), archiveRecord);
});

test("rejects archive records that disagree with the validated return", () => {
  expectCode(() => validateArchiveRecord({
    schema_version: "1.0.0",
    exchange_id: "AU-EX-ARCHIVE-002",
    archived_at: "2026-07-25T00:00:00Z",
    archived_by: "AU-CODEX-PRIMARY",
    review_reference: "product/reviews/report.md",
    result_status: "PARTIAL",
    decision: "NO_DECISION",
  }, {
    exchangeId: "AU-EX-ARCHIVE-002",
    returnManifest: { result_status: "COMPLETED", decision: "VERIFIED" },
  }), "ARCHIVE_RETURN_MISMATCH");
});

test("validates integrated outcomes against task, return, and archive provenance", () => {
  const taskManifest = {
    exchange_id: "AU-EX-OUTCOME-001",
    task_id: "TASK-OUTCOME-001",
    source_commit_sha: "a".repeat(40),
    review_commit_range: "b".repeat(40) + ".." + "a".repeat(40),
  };
  const returnManifest = { result_status: "COMPLETED", decision: "VERIFIED" };
  const archiveRecord = {
    archived_at: "2026-07-25T00:00:00Z",
    review_reference: "product/reviews/report.md",
  };
  const outcome = {
    schema_version: "1.0.0",
    exchange_id: taskManifest.exchange_id,
    source_task_id: taskManifest.task_id,
    result_status: "COMPLETED",
    validation_status: "VALID",
    decision: "VERIFIED",
    source_commit_sha: taskManifest.source_commit_sha,
    review_commit_range: taskManifest.review_commit_range,
    reviewer: "Independent Reviewer",
    canonical_report: "product/reviews/report.md",
    report_sha256: "c".repeat(64),
    return_manifest_sha256: "d".repeat(64),
    verified_scope: [],
    excluded_scope: [],
    follow_up_ids: [],
    archive_location: "claude/archive/AU-EX-OUTCOME-001",
    archive_review_reference: archiveRecord.review_reference,
    archived_at: archiveRecord.archived_at,
    integrated_by: "AU-CODEX-PRIMARY",
  };
  assert.equal(validateExchangeOutcome(outcome, {
    taskManifest,
    returnManifest,
    archiveRecord,
  }), outcome);
});

test("rejects outcomes with mismatched archive provenance", () => {
  expectCode(() => validateExchangeOutcome({
    schema_version: "1.0.0",
    exchange_id: "AU-EX-OUTCOME-002",
    source_task_id: "TASK-OUTCOME-002",
    result_status: "COMPLETED",
    validation_status: "VALID",
    decision: "VERIFIED",
    source_commit_sha: "a".repeat(40),
    reviewer: "Independent Reviewer",
    canonical_report: "product/reviews/report.md",
    report_sha256: "c".repeat(64),
    return_manifest_sha256: "d".repeat(64),
    verified_scope: [],
    excluded_scope: [],
    follow_up_ids: [],
    archive_location: "claude/archive/AU-EX-OUTCOME-002",
    archive_review_reference: "product/reviews/other.md",
    archived_at: "2026-07-25T00:00:00Z",
    integrated_by: "AU-CODEX-PRIMARY",
  }, {
    taskManifest: {
      exchange_id: "AU-EX-OUTCOME-002",
      task_id: "TASK-OUTCOME-002",
      source_commit_sha: "a".repeat(40),
    },
    returnManifest: { result_status: "COMPLETED", decision: "VERIFIED" },
    archiveRecord: {
      archived_at: "2026-07-25T00:00:00Z",
      review_reference: "product/reviews/report.md",
    },
  }), "OUTCOME_ARCHIVE_MISMATCH");
});
