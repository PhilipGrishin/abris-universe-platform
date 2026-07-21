#!/usr/bin/env node

import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  assertPortableRelativePath,
  assertSourceIsCurrent,
  assertUniqueExchangeId,
  canonicalManifestPath,
  fail,
  fileRecord,
  formatError,
  git,
  inspectTextSafety,
  isBinary,
  nowIso,
  parseCommonArgs,
  readJson,
  repoRoot,
  validateTaskManifest,
  writeJson,
  writeText,
} from "./lib/bridge-core.mjs";

function selected(path, includes, excludes) {
  const matches = (candidate) => candidate === "." || path === candidate || path.startsWith(`${candidate}/`);
  return includes.some(matches) && !excludes.some(matches);
}

function trackedFilesAtCommit(repo, commit, includes, excludes) {
  const raw = git(repo, ["ls-tree", "-r", "-z", commit]);
  const records = [];
  for (const entry of raw.split("\0").filter(Boolean)) {
    const tab = entry.indexOf("\t");
    const header = entry.slice(0, tab).split(" ");
    const path = entry.slice(tab + 1);
    if (!selected(path, includes, excludes)) continue;
    const [mode, type] = header;
    if (mode === "120000") fail(`Tracked symbolic link is prohibited from packages: ${path}`, "SYMLINK");
    if (type !== "blob" || mode !== "100644" && mode !== "100755") fail(`Unsupported Git object for ${path}.`, "UNSUPPORTED_FILE_TYPE");
    records.push(path);
  }
  if (records.length === 0) fail("The requested source selection contains no tracked files.", "EMPTY_PACKAGE");
  return records.sort();
}

function requestToManifest(request, includedFiles, preparedAt) {
  const checksumMap = Object.fromEntries(includedFiles.map((record) => [record.path, record.sha256]));
  return {
    schema_version: "1.0.0",
    exchange_id: request.exchange_id,
    task_id: request.task_id,
    task_type: request.task_type,
    requested_claude_role: request.requested_claude_role,
    source_commit_sha: request.source_commit_sha,
    source_branch: request.source_branch,
    ...(request.review_commit_range ? { review_commit_range: request.review_commit_range } : {}),
    prepared_at: preparedAt,
    prepared_by: request.prepared_by,
    purpose: request.purpose,
    scope: request.scope,
    out_of_scope: request.out_of_scope,
    required_inputs: request.required_inputs,
    included_files: includedFiles,
    expected_outputs: request.expected_outputs,
    acceptance_criteria: request.acceptance_criteria,
    authority_boundaries: request.authority_boundaries,
    documentation_impact: request.documentation_impact,
    ...(request.due_date ? { due_date: request.due_date } : {}),
    return_location: request.return_location,
    allowed_output_extensions: request.allowed_output_extensions,
    integrity_checksums: checksumMap,
  };
}

function packageReadme(manifest) {
  return `# Claude Exchange ${manifest.exchange_id}\n\n` +
    `This is a controlled, read-only review package prepared by ${manifest.prepared_by}.\n\n` +
    `## Task\n\n${manifest.purpose}\n\n` +
    `- Task ID: \`${manifest.task_id}\`\n` +
    `- Task type: \`${manifest.task_type}\`\n` +
    `- Requested role: ${manifest.requested_claude_role}\n` +
    `- Source branch: \`${manifest.source_branch}\`\n` +
    `- Source commit: \`${manifest.source_commit_sha}\`\n` +
    (manifest.review_commit_range ? `- Review range: \`${manifest.review_commit_range}\`\n` : "") +
    `\n## Instructions\n\n` +
    `1. Read \`task-manifest.json\` before reviewing any source.\n` +
    `2. Treat files below \`sources/\` as immutable evidence.\n` +
    `3. Do not use Git or modify the canonical repository.\n` +
    `4. Write only to \`${manifest.return_location}\` using the registered return schema.\n` +
    `5. Register every output file and its SHA-256 checksum.\n` +
    `6. Do not include secrets, binaries, symbolic links, hidden files, temporary files, or machine-specific absolute paths.\n` +
    `7. For independent acceptance, return exactly \`VERIFIED\` or \`REWORK_REQUIRED\`; do not fabricate evidence.\n`;
}

try {
  const args = parseCommonArgs(process.argv.slice(2));
  if (!args.request) fail("Usage: prepare-claude-package.mjs --request <path> [--apply]", "INVALID_ARGUMENT");
  const repo = repoRoot();
  const requestPath = join(repo, assertPortableRelativePath(args.request, { allowHidden: true }));
  const request = readJson(requestPath);
  const requiredRequestFields = [
    "exchange_id", "task_id", "task_type", "requested_claude_role", "source_commit_sha", "source_branch",
    "prepared_by", "purpose", "scope", "out_of_scope", "required_inputs", "expected_outputs",
    "acceptance_criteria", "authority_boundaries", "documentation_impact", "return_location",
    "allowed_output_extensions", "include_paths", "exclude_paths",
  ];
  for (const field of requiredRequestFields) if (request[field] === undefined) fail(`Request is missing ${field}.`, "INVALID_REQUEST");
  const includes = request.include_paths.map((path) => assertPortableRelativePath(path, { allowDot: true, allowHidden: true }));
  const excludes = request.exclude_paths.map((path) => assertPortableRelativePath(path, { allowHidden: true }));

  const preliminary = requestToManifest(request, [{ path: "pending.txt", sha256: "0".repeat(64), size_bytes: 0 }], request.prepared_at ?? nowIso());
  assertSourceIsCurrent(repo, preliminary);
  if (request.review_commit_range) git(repo, ["rev-parse", "--verify", request.review_commit_range.split("..")[0]]);

  const packageRoot = join(repo, "collaboration", "runtime", "packages", request.exchange_id);
  const manifestPath = canonicalManifestPath(repo, request.exchange_id);
  assertUniqueExchangeId(repo, request.exchange_id, manifestPath);
  if (args.apply && (existsSync(packageRoot) || existsSync(manifestPath))) fail("Package or canonical manifest already exists; refusing to overwrite it.", "DESTINATION_EXISTS");

  const trackedPaths = trackedFilesAtCommit(repo, request.source_commit_sha, includes, excludes);
  const payloads = [];
  let totalBytes = 0;
  for (const sourcePath of trackedPaths) {
    const buffer = git(repo, ["show", `${request.source_commit_sha}:${sourcePath}`], { binary: true });
    if (isBinary(buffer)) fail(`Binary source must be explicitly excluded or converted before packaging: ${sourcePath}`, "BINARY_FILE");
    inspectTextSafety(buffer.toString("utf8"), sourcePath);
    const packagePath = `sources/repository/${sourcePath}`;
    payloads.push({ packagePath, buffer });
    totalBytes += buffer.length;
  }

  if (request.review_commit_range) {
    const artifacts = [
      ["sources/review/review-range.diff", ["diff", "--no-ext-diff", "--no-color", request.review_commit_range]],
      ["sources/review/review-range.stat.txt", ["diff", "--stat", request.review_commit_range]],
      ["sources/review/review-range.commits.txt", ["log", "--format=%H %s", request.review_commit_range]],
    ];
    for (const [packagePath, command] of artifacts) {
      const buffer = Buffer.from(git(repo, command), "utf8");
      inspectTextSafety(buffer.toString("utf8"), packagePath);
      payloads.push({ packagePath, buffer });
      totalBytes += buffer.length;
    }
  }

  const includedFiles = payloads.map(({ packagePath, buffer }) => fileRecord(packagePath, buffer));
  const manifest = validateTaskManifest(requestToManifest(request, includedFiles, request.prepared_at ?? nowIso()));

  const summary = {
    mode: args.apply ? "apply" : "dry-run",
    exchange_id: manifest.exchange_id,
    source_commit_sha: manifest.source_commit_sha,
    review_commit_range: manifest.review_commit_range ?? null,
    file_count: includedFiles.length,
    total_bytes: totalBytes,
    package_root: "collaboration/runtime/packages/" + manifest.exchange_id,
    canonical_manifest: `collaboration/manifests/${manifest.exchange_id}/task-manifest.json`,
  };

  if (args.apply) {
    for (const { packagePath, buffer } of payloads) {
      const destination = join(packageRoot, packagePath);
      mkdirSync(dirname(destination), { recursive: true });
      writeText(destination, buffer);
    }
    writeJson(join(packageRoot, "task-manifest.json"), manifest);
    writeText(join(packageRoot, "README.md"), packageReadme(manifest));
    writeJson(manifestPath, manifest);
  }
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
