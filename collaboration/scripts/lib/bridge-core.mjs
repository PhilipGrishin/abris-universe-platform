import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";

export const TASK_TYPES = new Set([
  "PRODUCT_TASK_PACKAGE",
  "PRODUCT_CLARIFICATION",
  "PRODUCT_DECISION",
  "INDEPENDENT_ACCEPTANCE_REVIEW",
  "REQUIREMENTS_REVIEW",
  "RESEARCH_REQUEST",
  "DOCUMENTATION_REVIEW",
]);

export const RESULT_TYPES = new Set([
  "PRODUCT_TASK_PACKAGE",
  "PRODUCT_CLARIFICATION",
  "PRODUCT_DECISION",
  "INDEPENDENT_ACCEPTANCE_REVIEW",
  "REQUIREMENTS_REVIEW",
  "RESEARCH_REPORT",
  "DOCUMENTATION_REVIEW",
]);

export const DOCUMENTATION_IMPACTS = new Set(["None", "Minor", "Material", "Breaking"]);
export const RESULT_STATUSES = new Set(["COMPLETED", "BLOCKED", "PARTIAL"]);
export const DECISIONS = new Set(["VERIFIED", "REWORK_REQUIRED", "NO_DECISION"]);
export const DEFAULT_OUTPUT_EXTENSIONS = [".md", ".json", ".txt", ".csv"];
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const DEFAULT_MAX_PACKAGE_SIZE = 50 * 1024 * 1024;

const TEMP_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{16,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|password|client[_-]?secret)\s*[:=]\s*["']?[A-Za-z0-9+\/_=.-]{16,}["']?/i,
];
const MACHINE_PATH_PATTERNS = [
  /(^|[\s"'`(])\/Users\/[A-Za-z0-9._-]+\//m,
  /(^|[\s"'`(])\/home\/[A-Za-z0-9._-]+\//m,
  /(^|[\s"'`(])[A-Za-z]:\\Users\\[^\s"']+/m,
];

export class BridgeError extends Error {
  constructor(message, code = "BRIDGE_VALIDATION_ERROR") {
    super(message);
    this.name = "BridgeError";
    this.code = code;
  }
}

export function fail(message, code) {
  throw new BridgeError(message, code);
}

export function repoRoot(start = process.cwd()) {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: start,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    fail("The command must run inside the canonical Git repository.", "NOT_A_GIT_REPOSITORY");
  }
}

export function git(repo, args, options = {}) {
  return execFileSync("git", args, {
    cwd: repo,
    encoding: options.binary ? undefined : "utf8",
    maxBuffer: options.maxBuffer ?? 100 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

export function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Cannot read valid JSON from ${path}: ${error.message}`, "INVALID_JSON");
  }
}

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, path);
}

export function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, value, { mode: 0o600 });
  renameSync(temporary, path);
}

export function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

export function sha256File(path) {
  return sha256(readFileSync(path));
}

export function isBinary(buffer) {
  if (buffer.includes(0)) return true;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  let suspicious = 0;
  for (const byte of sample) {
    if (byte < 7 || (byte > 13 && byte < 32)) suspicious += 1;
  }
  return sample.length > 0 && suspicious / sample.length > 0.08;
}

export function inspectTextSafety(text, label) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) fail(`Potential secret detected in ${label}.`, "POTENTIAL_SECRET");
  }
  for (const pattern of MACHINE_PATH_PATTERNS) {
    if (pattern.test(text)) fail(`Machine-specific absolute path detected in ${label}.`, "MACHINE_PATH");
  }
}

export function assertPortableRelativePath(value, options = {}) {
  const { allowDot = false, allowHidden = false } = options;
  if (typeof value !== "string" || value.length === 0) fail("A non-empty relative path is required.");
  if (value === "." && allowDot) return value;
  if (isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value) || value.startsWith("\\\\")) {
    fail(`Absolute path is prohibited: ${value}`, "ABSOLUTE_PATH");
  }
  if (value.includes("\\")) fail(`Backslashes are prohibited in portable paths: ${value}`, "NON_PORTABLE_PATH");
  if (value.includes("\0")) fail("NUL bytes are prohibited in paths.");
  const parts = value.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    fail(`Path traversal or ambiguous path component detected: ${value}`, "PATH_TRAVERSAL");
  }
  for (const part of parts) {
    if (!allowHidden && part.startsWith(".")) fail(`Hidden path is prohibited: ${value}`, "HIDDEN_FILE");
    if (TEMP_NAMES.has(part) || part.startsWith("~$") || part.endsWith("~") || /\.(?:tmp|temp|swp|swo)$/i.test(part)) {
      fail(`Temporary or operating-system file is prohibited: ${value}`, "TEMPORARY_FILE");
    }
  }
  return value;
}

export function confinedPath(root, relativePath, options = {}) {
  assertPortableRelativePath(relativePath, options);
  const rootPath = resolve(root);
  const target = resolve(rootPath, relativePath);
  if (target !== rootPath && !target.startsWith(`${rootPath}${sep}`)) {
    fail(`Path escapes its allowed root: ${relativePath}`, "PATH_TRAVERSAL");
  }
  return target;
}

export function assertNoSymlinkPath(root, relativePath, options = {}) {
  const target = confinedPath(root, relativePath, options);
  const rootPath = resolve(root);
  const rel = relative(rootPath, target);
  let cursor = rootPath;
  for (const part of rel.split(sep).filter(Boolean)) {
    cursor = join(cursor, part);
    if (!existsSync(cursor)) fail(`Expected path does not exist: ${relativePath}`, "MISSING_FILE");
    if (lstatSync(cursor).isSymbolicLink()) fail(`Symbolic links are prohibited: ${relativePath}`, "SYMLINK");
  }
  return target;
}

export function assertDirectoryNoSymlinks(root) {
  const rootReal = realpathSync(root);
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      if (entry.isSymbolicLink()) fail(`Symbolic links are prohibited: ${relative(root, full)}`, "SYMLINK");
      if (entry.isDirectory()) walk(full);
      else if (!entry.isFile()) fail(`Unsupported filesystem entry: ${relative(root, full)}`, "UNSUPPORTED_FILE_TYPE");
    }
  };
  walk(rootReal);
}

export function validateTextFile(path, label, limits = {}) {
  const stat = statSync(path);
  const max = limits.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE;
  if (!stat.isFile()) fail(`${label} is not a regular file.`, "UNSUPPORTED_FILE_TYPE");
  if (stat.size > max) fail(`${label} exceeds the ${max}-byte file limit.`, "FILE_TOO_LARGE");
  const buffer = readFileSync(path);
  if (isBinary(buffer)) fail(`Binary file is prohibited: ${label}`, "BINARY_FILE");
  inspectTextSafety(buffer.toString("utf8"), label);
  return { buffer, size: stat.size, sha256: sha256(buffer) };
}

export function ensureAllowedExtension(relativePath, allowed = DEFAULT_OUTPUT_EXTENSIONS) {
  const extension = extname(relativePath).toLowerCase();
  if (!allowed.includes(extension)) {
    fail(`Output extension ${extension || "<none>"} is not allowed for ${relativePath}.`, "UNEXPECTED_EXTENSION");
  }
}

export function listFilesRecursive(root, options = {}) {
  if (!existsSync(root)) return [];
  const results = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      const rel = relative(root, full).split(sep).join("/");
      assertPortableRelativePath(rel, { allowHidden: options.allowHidden ?? false });
      if (entry.isSymbolicLink()) fail(`Symbolic links are prohibited: ${rel}`, "SYMLINK");
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) results.push(rel);
      else fail(`Unsupported filesystem entry: ${rel}`, "UNSUPPORTED_FILE_TYPE");
    }
  };
  walk(root);
  return results.sort();
}

export function copyDirectorySafe(source, destination) {
  if (existsSync(destination)) fail(`Destination already exists: ${destination}`, "DESTINATION_EXISTS");
  assertDirectoryNoSymlinks(source);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, errorOnExist: true, force: false });
}

export function removeDirectory(path) {
  rmSync(path, { recursive: true, force: false });
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string.`, "MANIFEST_SCHEMA");
}

function requireStringArray(value, label, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    fail(`${label} must be ${allowEmpty ? "an" : "a non-empty"} array of strings.`, "MANIFEST_SCHEMA");
  }
}

function validateFileRecords(value, label, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) fail(`${label} must contain file records.`, "MANIFEST_SCHEMA");
  const paths = new Set();
  for (const record of value) {
    if (!record || typeof record !== "object") fail(`${label} contains an invalid record.`, "MANIFEST_SCHEMA");
    const allowedKeys = new Set(["path", "sha256", "size_bytes"]);
    if (Object.keys(record).some((key) => !allowedKeys.has(key))) fail(`${label} contains an unknown field.`, "MANIFEST_SCHEMA");
    assertPortableRelativePath(record.path, { allowHidden: true });
    if (!/^[0-9a-f]{64}$/.test(record.sha256 ?? "")) fail(`${label} has an invalid SHA-256.`, "MANIFEST_SCHEMA");
    if (!Number.isSafeInteger(record.size_bytes) || record.size_bytes < 0) fail(`${label} has an invalid size.`, "MANIFEST_SCHEMA");
    if (paths.has(record.path)) fail(`${label} contains duplicate path ${record.path}.`, "DUPLICATE_PATH");
    paths.add(record.path);
  }
}

function validateChecksumMap(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length === 0) {
    fail(`${label} must be a non-empty checksum map.`, "MANIFEST_SCHEMA");
  }
  for (const [path, checksum] of Object.entries(value)) {
    assertPortableRelativePath(path, { allowHidden: true });
    if (!/^[0-9a-f]{64}$/.test(checksum)) fail(`${label} contains an invalid checksum.`, "MANIFEST_SCHEMA");
  }
}

function rejectUnknownKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(`${label} contains unsupported field ${key}.`, "MANIFEST_SCHEMA");
  }
}

export function validateTaskManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) fail("Task manifest must be an object.", "MANIFEST_SCHEMA");
  rejectUnknownKeys(manifest, new Set([
    "schema_version", "exchange_id", "task_id", "task_type", "requested_claude_role",
    "source_commit_sha", "source_branch", "review_commit_range", "prepared_at", "prepared_by",
    "purpose", "scope", "out_of_scope", "required_inputs", "included_files", "expected_outputs",
    "acceptance_criteria", "authority_boundaries", "documentation_impact", "due_date",
    "return_location", "allowed_output_extensions", "integrity_checksums",
  ]), "Task manifest");
  if (manifest.schema_version !== "1.0.0") fail("Unsupported task manifest schema version.", "MANIFEST_SCHEMA");
  if (!/^[A-Z0-9][A-Z0-9._-]{5,127}$/.test(manifest.exchange_id ?? "")) fail("Invalid exchange_id.", "MANIFEST_SCHEMA");
  requireString(manifest.task_id, "task_id");
  if (!TASK_TYPES.has(manifest.task_type)) fail("Unsupported task_type.", "MANIFEST_SCHEMA");
  requireString(manifest.requested_claude_role, "requested_claude_role");
  if (!/^[0-9a-f]{40}$/.test(manifest.source_commit_sha ?? "")) fail("source_commit_sha must be a full Git SHA.", "MANIFEST_SCHEMA");
  requireString(manifest.source_branch, "source_branch");
  if (manifest.review_commit_range && !/^[0-9a-f]{7,40}\.\.[0-9a-f]{7,40}$/.test(manifest.review_commit_range)) fail("Invalid review_commit_range.", "MANIFEST_SCHEMA");
  if (Number.isNaN(Date.parse(manifest.prepared_at))) fail("prepared_at must be an ISO date-time.", "MANIFEST_SCHEMA");
  requireString(manifest.prepared_by, "prepared_by");
  requireString(manifest.purpose, "purpose");
  requireStringArray(manifest.scope, "scope");
  requireStringArray(manifest.out_of_scope, "out_of_scope");
  requireStringArray(manifest.required_inputs, "required_inputs");
  validateFileRecords(manifest.included_files, "included_files");
  requireStringArray(manifest.expected_outputs, "expected_outputs");
  requireStringArray(manifest.acceptance_criteria, "acceptance_criteria");
  if (!manifest.authority_boundaries || typeof manifest.authority_boundaries !== "object") fail("authority_boundaries is required.", "MANIFEST_SCHEMA");
  rejectUnknownKeys(manifest.authority_boundaries, new Set(["product_authority", "engineering_authority", "documentation_authority", "git_authority"]), "authority_boundaries");
  for (const key of ["product_authority", "engineering_authority", "documentation_authority", "git_authority"]) requireString(manifest.authority_boundaries[key], `authority_boundaries.${key}`);
  if (!DOCUMENTATION_IMPACTS.has(manifest.documentation_impact)) fail("Invalid documentation_impact.", "MANIFEST_SCHEMA");
  requireString(manifest.return_location, "return_location");
  assertPortableRelativePath(manifest.return_location, { allowHidden: false });
  if (manifest.allowed_output_extensions) {
    if (!Array.isArray(manifest.allowed_output_extensions) || manifest.allowed_output_extensions.length === 0) fail("allowed_output_extensions must be non-empty.", "MANIFEST_SCHEMA");
    for (const extension of manifest.allowed_output_extensions) if (!/^\.[a-z0-9]+$/.test(extension)) fail("Invalid allowed output extension.", "MANIFEST_SCHEMA");
  }
  validateChecksumMap(manifest.integrity_checksums, "integrity_checksums");
  const records = new Map(manifest.included_files.map((record) => [record.path, record.sha256]));
  for (const [path, checksum] of Object.entries(manifest.integrity_checksums)) {
    if (!records.has(path) || records.get(path) !== checksum) fail(`Checksum map is inconsistent for ${path}.`, "CHECKSUM_MISMATCH");
  }
  return manifest;
}

export function validateReturnManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) fail("Return manifest must be an object.", "MANIFEST_SCHEMA");
  rejectUnknownKeys(manifest, new Set([
    "schema_version", "exchange_id", "source_task_id", "claude_role", "result_type",
    "result_status", "created_at", "reviewed_sources", "findings", "blocking_findings",
    "non_blocking_findings", "decision", "required_rework", "open_questions", "output_files",
    "checksums", "product_authority_statement", "limitations",
  ]), "Return manifest");
  if (manifest.schema_version !== "1.0.0") fail("Unsupported return manifest schema version.", "MANIFEST_SCHEMA");
  if (!/^[A-Z0-9][A-Z0-9._-]{5,127}$/.test(manifest.exchange_id ?? "")) fail("Invalid exchange_id.", "MANIFEST_SCHEMA");
  requireString(manifest.source_task_id, "source_task_id");
  requireString(manifest.claude_role, "claude_role");
  if (!RESULT_TYPES.has(manifest.result_type)) fail("Unsupported result_type.", "MANIFEST_SCHEMA");
  if (!RESULT_STATUSES.has(manifest.result_status)) fail("Unsupported result_status.", "MANIFEST_SCHEMA");
  if (Number.isNaN(Date.parse(manifest.created_at))) fail("created_at must be an ISO date-time.", "MANIFEST_SCHEMA");
  validateFileRecords(manifest.reviewed_sources, "reviewed_sources");
  for (const key of ["findings", "blocking_findings", "non_blocking_findings", "required_rework", "open_questions", "limitations"]) requireStringArray(manifest[key], key, true);
  if (!DECISIONS.has(manifest.decision)) fail("Unsupported decision.", "MANIFEST_SCHEMA");
  if (manifest.result_type === "INDEPENDENT_ACCEPTANCE_REVIEW" && !new Set(["VERIFIED", "REWORK_REQUIRED"]).has(manifest.decision)) {
    fail("Independent acceptance must return exactly VERIFIED or REWORK_REQUIRED.", "AMBIGUOUS_ACCEPTANCE_DECISION");
  }
  validateFileRecords(manifest.output_files, "output_files");
  validateChecksumMap(manifest.checksums, "checksums");
  requireString(manifest.product_authority_statement, "product_authority_statement");
  const records = new Map(manifest.output_files.map((record) => [record.path, record.sha256]));
  for (const [path, checksum] of Object.entries(manifest.checksums)) {
    if (!records.has(path) || records.get(path) !== checksum) fail(`Output checksum map is inconsistent for ${path}.`, "CHECKSUM_MISMATCH");
  }
  return manifest;
}

export function validateArchiveRecord(record, { exchangeId, returnManifest }) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail("Archive record must be an object.", "ARCHIVE_RECORD_SCHEMA");
  }
  rejectUnknownKeys(record, new Set([
    "schema_version", "exchange_id", "archived_at", "archived_by",
    "review_reference", "result_status", "decision",
  ]), "Archive record");
  if (record.schema_version !== "1.0.0") {
    fail("Unsupported archive record schema version.", "ARCHIVE_RECORD_SCHEMA");
  }
  if (record.exchange_id !== exchangeId) {
    fail("Archive record exchange_id does not match the exchange.", "EXCHANGE_ID_MISMATCH");
  }
  if (Number.isNaN(Date.parse(record.archived_at))) {
    fail("Archive record archived_at must be an ISO date-time.", "ARCHIVE_RECORD_SCHEMA");
  }
  requireString(record.archived_by, "archived_by");
  requireString(record.review_reference, "review_reference");
  assertPortableRelativePath(record.review_reference, { allowHidden: false });
  if (!RESULT_STATUSES.has(record.result_status)) {
    fail("Archive record has an unsupported result_status.", "ARCHIVE_RECORD_SCHEMA");
  }
  if (!DECISIONS.has(record.decision)) {
    fail("Archive record has an unsupported decision.", "ARCHIVE_RECORD_SCHEMA");
  }
  if (record.result_status !== returnManifest.result_status || record.decision !== returnManifest.decision) {
    fail("Archive record does not match the validated return manifest.", "ARCHIVE_RETURN_MISMATCH");
  }
  return record;
}

export function validateExchangeOutcome(outcome, { taskManifest, returnManifest, archiveRecord }) {
  if (!outcome || typeof outcome !== "object" || Array.isArray(outcome)) {
    fail("Exchange outcome must be an object.", "OUTCOME_SCHEMA");
  }
  rejectUnknownKeys(outcome, new Set([
    "schema_version", "exchange_id", "source_task_id", "result_status",
    "validation_status", "decision", "source_commit_sha", "review_commit_range",
    "reviewer", "canonical_report", "report_sha256", "return_manifest_sha256",
    "verified_scope", "excluded_scope", "follow_up_ids", "archive_location",
    "archive_review_reference", "archived_at", "integrated_by",
  ]), "Exchange outcome");
  if (outcome.schema_version !== "1.0.0") fail("Unsupported outcome schema version.", "OUTCOME_SCHEMA");
  if (outcome.exchange_id !== taskManifest.exchange_id) fail("Outcome exchange_id does not match the task.", "EXCHANGE_ID_MISMATCH");
  if (outcome.source_task_id !== taskManifest.task_id) fail("Outcome source_task_id does not match the task.", "TASK_ID_MISMATCH");
  if (outcome.source_commit_sha !== taskManifest.source_commit_sha) fail("Outcome source commit does not match the task.", "OUTCOME_SOURCE_MISMATCH");
  if ((outcome.review_commit_range ?? null) !== (taskManifest.review_commit_range ?? null)) {
    fail("Outcome review commit range does not match the task.", "OUTCOME_SOURCE_MISMATCH");
  }
  if (outcome.validation_status !== "VALID") fail("Outcome validation_status must be VALID.", "OUTCOME_SCHEMA");
  if (outcome.result_status !== returnManifest.result_status || outcome.decision !== returnManifest.decision) {
    fail("Outcome does not match the validated return manifest.", "OUTCOME_RETURN_MISMATCH");
  }
  for (const key of ["reviewer", "canonical_report", "archive_location", "archive_review_reference", "integrated_by"]) {
    requireString(outcome[key], key);
  }
  for (const key of ["canonical_report", "archive_location", "archive_review_reference"]) {
    assertPortableRelativePath(outcome[key], { allowHidden: false });
  }
  for (const key of ["report_sha256", "return_manifest_sha256"]) {
    if (!/^[0-9a-f]{64}$/.test(outcome[key] ?? "")) fail(`${key} must be a SHA-256.`, "OUTCOME_SCHEMA");
  }
  for (const key of ["verified_scope", "excluded_scope", "follow_up_ids"]) {
    requireStringArray(outcome[key], key, true);
  }
  if (outcome.archived_at !== archiveRecord.archived_at
      || outcome.archive_review_reference !== archiveRecord.review_reference) {
    fail("Outcome archive provenance does not match the archive record.", "OUTCOME_ARCHIVE_MISMATCH");
  }
  return outcome;
}

export function loadBridgeConfig(repo) {
  const localPath = join(repo, ".collaboration-bridge.local.json");
  if (!existsSync(localPath)) fail(`Missing local bridge configuration: ${localPath}`, "MISSING_LOCAL_CONFIG");
  const config = readJson(localPath);
  if (config.schema_version !== "1.0.0") fail("Unsupported local bridge configuration version.", "INVALID_LOCAL_CONFIG");
  if (typeof config.external_bridge_root !== "string" || !isAbsolute(config.external_bridge_root)) fail("external_bridge_root must be an absolute local path.", "INVALID_LOCAL_CONFIG");
  return {
    externalBridgeRoot: resolve(config.external_bridge_root),
    maxFileSizeBytes: config.max_file_size_bytes ?? DEFAULT_MAX_FILE_SIZE,
    maxPackageSizeBytes: config.max_package_size_bytes ?? DEFAULT_MAX_PACKAGE_SIZE,
  };
}

export function parseCommonArgs(argv) {
  const args = { apply: false, initialize: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") args.apply = true;
    else if (arg === "--initialize") args.initialize = true;
    else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) fail(`Missing value for ${arg}.`, "INVALID_ARGUMENT");
      args[key] = value;
      index += 1;
    } else fail(`Unexpected argument: ${arg}`, "INVALID_ARGUMENT");
  }
  return args;
}

export function formatError(error) {
  if (error instanceof BridgeError) return `${error.code}: ${error.message}`;
  return `UNEXPECTED_ERROR: ${error.stack ?? error.message}`;
}

export function canonicalManifestPath(repo, exchangeId) {
  assertPortableRelativePath(exchangeId);
  return join(repo, "collaboration", "manifests", exchangeId, "task-manifest.json");
}

export function assertUniqueExchangeId(repo, exchangeId, expectedPath = undefined) {
  const root = join(repo, "collaboration", "manifests");
  if (!existsSync(root)) return;
  const matches = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const taskPath = join(root, entry.name, "task-manifest.json");
    const requestPath = join(root, entry.name, "request.json");
    const ids = new Set();
    if (existsSync(taskPath)) ids.add(readJson(taskPath).exchange_id);
    if (existsSync(requestPath)) ids.add(readJson(requestPath).exchange_id);
    if (ids.size > 1) fail(`Exchange directory ${entry.name} contains conflicting IDs.`, "DUPLICATE_EXCHANGE_ID");
    if (ids.has(exchangeId)) matches.push(resolve(existsSync(taskPath) ? taskPath : requestPath));
  }
  const allowed = expectedPath ? resolve(expectedPath) : undefined;
  const allowedDirectory = allowed ? dirname(allowed) : undefined;
  const unexpected = matches.filter((path) => dirname(path) !== allowedDirectory);
  if (unexpected.length > 0 || matches.length > 1) fail(`Duplicate exchange_id ${exchangeId} detected.`, "DUPLICATE_EXCHANGE_ID");
}

export function assertSourceIsCurrent(repo, manifest) {
  try {
    git(repo, ["cat-file", "-e", `${manifest.source_commit_sha}^{commit}`]);
  } catch {
    fail(`Source commit does not exist: ${manifest.source_commit_sha}`, "UNKNOWN_SOURCE_COMMIT");
  }
  let branchSha;
  try {
    branchSha = git(repo, ["rev-parse", `refs/heads/${manifest.source_branch}`]).trim();
  } catch {
    fail(`Local source branch does not exist: ${manifest.source_branch}`, "UNKNOWN_SOURCE_BRANCH");
  }
  if (branchSha !== manifest.source_commit_sha) {
    fail(`Source package is stale: ${manifest.source_branch} is ${branchSha}, expected ${manifest.source_commit_sha}.`, "STALE_SOURCE_COMMIT");
  }
}

export function verifyPackageFiles(packageRoot, manifest, limits = {}) {
  let total = 0;
  const expected = new Set();
  for (const record of manifest.included_files) {
    assertPortableRelativePath(record.path, { allowHidden: true });
    const full = assertNoSymlinkPath(packageRoot, record.path, { allowHidden: true });
    const result = validateTextFile(full, record.path, limits);
    total += result.size;
    if (result.size !== record.size_bytes || result.sha256 !== record.sha256 || manifest.integrity_checksums[record.path] !== result.sha256) {
      fail(`Package integrity check failed for ${record.path}.`, "CHECKSUM_MISMATCH");
    }
    expected.add(record.path);
  }
  const max = limits.maxPackageSizeBytes ?? DEFAULT_MAX_PACKAGE_SIZE;
  if (total > max) fail(`Package exceeds the ${max}-byte package limit.`, "PACKAGE_TOO_LARGE");
  return { fileCount: expected.size, totalBytes: total };
}

export function validateClaudeReturn({ outputRoot, taskManifest, limits = {} }) {
  assertDirectoryNoSymlinks(outputRoot);
  const topLevel = readdirSync(outputRoot, { withFileTypes: true });
  for (const entry of topLevel) {
    assertPortableRelativePath(entry.name, { allowHidden: false });
    const allowed = entry.name === "return-manifest.json" && entry.isFile() || entry.name === "outputs" && entry.isDirectory();
    if (!allowed) fail(`Unregistered top-level return entry: ${entry.name}`, "UNREGISTERED_OUTPUT_FILE");
  }
  const manifestPath = join(outputRoot, "return-manifest.json");
  if (!existsSync(manifestPath)) fail("Claude return is missing return-manifest.json.", "MISSING_RETURN_MANIFEST");
  validateTextFile(manifestPath, "return-manifest.json", limits);
  const returnManifest = validateReturnManifest(readJson(manifestPath));
  if (returnManifest.exchange_id !== taskManifest.exchange_id) fail("Return exchange_id does not match the task.", "EXCHANGE_ID_MISMATCH");
  if (returnManifest.source_task_id !== taskManifest.task_id) fail("Return source_task_id does not match the task.", "TASK_ID_MISMATCH");
  if (returnManifest.claude_role !== taskManifest.requested_claude_role) fail("Claude role does not match the requested role.", "ROLE_MISMATCH");
  const expectedResultType = taskManifest.task_type === "RESEARCH_REQUEST" ? "RESEARCH_REPORT" : taskManifest.task_type;
  if (returnManifest.result_type !== expectedResultType) fail("Return result_type does not match the task type.", "RESULT_TYPE_MISMATCH");

  const sourceRecords = new Map(taskManifest.included_files.map((record) => [record.path, record]));
  const reviewed = new Set();
  for (const record of returnManifest.reviewed_sources) {
    const source = sourceRecords.get(record.path);
    if (!source || source.sha256 !== record.sha256 || source.size_bytes !== record.size_bytes) {
      fail(`Reviewed source is missing or has an invalid checksum: ${record.path}`, "REVIEWED_SOURCE_MISMATCH");
    }
    reviewed.add(record.path);
  }
  for (const required of taskManifest.required_inputs) {
    if (sourceRecords.has(required) && !reviewed.has(required)) fail(`Required source was not reviewed: ${required}`, "MISSING_REVIEWED_SOURCE");
  }

  const outputsRoot = join(outputRoot, "outputs");
  if (!existsSync(outputsRoot)) fail("Claude return is missing the outputs directory.", "MISSING_OUTPUT_DIRECTORY");
  const actualFiles = listFilesRecursive(outputsRoot, { allowHidden: false });
  const registered = new Map(returnManifest.output_files.map((record) => [record.path, record]));
  if (actualFiles.length !== registered.size || actualFiles.some((path) => !registered.has(path))) {
    fail("Claude return contains missing or unregistered output files.", "UNREGISTERED_OUTPUT_FILE");
  }
  const allowed = taskManifest.allowed_output_extensions ?? DEFAULT_OUTPUT_EXTENSIONS;
  let total = 0;
  for (const relativePath of actualFiles) {
    ensureAllowedExtension(relativePath, allowed);
    const full = assertNoSymlinkPath(outputsRoot, relativePath, { allowHidden: false });
    const result = validateTextFile(full, relativePath, limits);
    total += result.size;
    const record = registered.get(relativePath);
    if (record.size_bytes !== result.size || record.sha256 !== result.sha256 || returnManifest.checksums[relativePath] !== result.sha256) {
      fail(`Output integrity check failed for ${relativePath}.`, "CHECKSUM_MISMATCH");
    }
  }
  const max = limits.maxPackageSizeBytes ?? DEFAULT_MAX_PACKAGE_SIZE;
  if (total > max) fail(`Claude return exceeds the ${max}-byte package limit.`, "PACKAGE_TOO_LARGE");
  return { returnManifest, outputFileCount: actualFiles.length, totalBytes: total };
}

export function markdownEscape(value) {
  return String(value).replace(/\|/g, "\\|");
}

export function nowIso() {
  return new Date().toISOString();
}

export function fileRecord(path, buffer) {
  return { path, sha256: sha256(buffer), size_bytes: buffer.length };
}

export function basenameSafe(path) {
  return basename(path);
}
