import assert from "node:assert/strict";
import test from "node:test";

import {
  DomainValidationError,
  createImmutableCanonicalSnapshot,
  rebuildProgressState,
  validateCanonicalPatternVersion,
  validateProject,
  type CanonicalPatternVersionContext,
  type FullCrossStitch,
  type ProgressEvent,
} from "../src/index.ts";

const timestamp = "2026-07-25T12:00:00.000Z";
const sourceHash = "a".repeat(64);
const contentHash = "b".repeat(64);

function validContext(): CanonicalPatternVersionContext {
  return {
    sourceFile: {
      id: "source-1",
      originalName: "route-1.oxs",
      mediaType: "application/xml",
      declaredFormat: "oxs",
      detectedFormatVersion: "1.0",
      byteLength: 100,
      sha256: sourceHash,
      bytesRef: "blob:source-1",
      retentionStatus: "retained",
      receivedAt: timestamp,
    },
    importJob: {
      id: "import-1",
      sourceFileId: "source-1",
      importerId: "oxs",
      importerVersion: "0.1.0",
      status: "completed",
      startedAt: timestamp,
      completedAt: timestamp,
      reportRef: "report:import-1",
      warningCodes: [],
    },
    pattern: {
      id: "pattern-1",
      metadata: {
        name: "Route 1",
        width: 7,
        height: 5,
        fabric: {
          type: null,
          countX: null,
          countY: null,
          countUnit: null,
          clothPaletteItemId: "palette-cloth",
        },
      },
      grid: {
        width: 7,
        height: 5,
        origin: "top-left",
        coordinateBase: 0,
        xDirection: "right",
        yDirection: "down",
      },
      paletteItems: [
        {
          id: "palette-cloth",
          sourceIndex: 0,
          role: "cloth",
          threadBrand: null,
          brandCode: null,
          displayName: "Cloth",
          displayColor: "#FFFFFF",
        },
        {
          id: "palette-red",
          sourceIndex: 1,
          role: "thread",
          threadBrand: null,
          brandCode: "1",
          displayName: "Red",
          displayColor: "#FF0000",
        },
        {
          id: "palette-blue",
          sourceIndex: 2,
          role: "thread",
          threadBrand: null,
          brandCode: "2",
          displayName: "Blue",
          displayColor: "#0000FF",
        },
      ],
      symbols: [
        {
          id: "symbol-a",
          sourceCode: "A",
          visual: {
            kind: "text-code-point",
            value: "A",
            fontFamily: "sans-serif",
          },
        },
        {
          id: "symbol-b",
          sourceCode: "B",
          visual: {
            kind: "generated",
            generatorVersion: 1,
            ordinal: 0,
          },
        },
      ],
      createdAt: timestamp,
      provenanceRef: "source:source-1",
    },
    patternVersion: {
      id: "pattern-version-1",
      patternId: "pattern-1",
      canonicalFormatVersion: "1.0.0",
      createdAt: timestamp,
      sourceFileId: "source-1",
      importJobId: "import-1",
      canonicalContentHash: contentHash,
      tileSetRef: "tiles:pattern-version-1",
    },
    stitches: [
      {
        id: "stitch-1",
        type: "full-cross",
        x: 0,
        y: 0,
        symbolId: "symbol-a",
        paletteItemId: "palette-red",
      },
      {
        id: "stitch-2",
        type: "full-cross",
        x: 6,
        y: 4,
        symbolId: "symbol-a",
        paletteItemId: "palette-blue",
      },
      {
        id: "stitch-3",
        type: "full-cross",
        x: 2,
        y: 3,
        symbolId: "symbol-b",
        paletteItemId: "palette-blue",
      },
    ],
  };
}

function expectCode(
  code: DomainValidationError["code"],
  action: () => void,
): void {
  assert.throws(
    action,
    (error) => error instanceof DomainValidationError && error.code === code,
  );
}

test("accepts the canonical route-1 grid and independent symbol/palette references", () => {
  assert.doesNotThrow(() => validateCanonicalPatternVersion(validContext()));
});

test("freezes a detached canonical snapshot", () => {
  const source = validContext();
  const snapshot = createImmutableCanonicalSnapshot(source);

  assert.notEqual(snapshot, source);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.pattern.paletteItems), true);
  assert.throws(() => {
    (snapshot.pattern as { id: string }).id = "mutated";
  }, TypeError);
  assert.equal(source.pattern.id, "pattern-1");
});

test("rejects dimension aliases that diverge from the canonical grid", () => {
  const context = validContext();
  const invalid = {
    ...context,
    pattern: {
      ...context.pattern,
      metadata: { ...context.pattern.metadata, width: 8 },
    },
  };
  expectCode("INVALID_PATTERN", () =>
    validateCanonicalPatternVersion(invalid),
  );
});

test("rejects duplicate full-cross cells", () => {
  const context = validContext();
  const duplicate: FullCrossStitch = {
    ...context.stitches[0]!,
    id: "stitch-duplicate",
    symbolId: "symbol-b",
  };
  expectCode("DUPLICATE_STITCH_CELL", () =>
    validateCanonicalPatternVersion({
      ...context,
      stitches: [...context.stitches, duplicate],
    }),
  );
});

test("rejects broken symbol references and cloth stitch references", () => {
  const context = validContext();
  expectCode("BROKEN_REFERENCE", () =>
    validateCanonicalPatternVersion({
      ...context,
      stitches: [
        { ...context.stitches[0]!, symbolId: "symbol-missing" },
      ],
    }),
  );
  expectCode("CLOTH_STITCH_REFERENCE", () =>
    validateCanonicalPatternVersion({
      ...context,
      stitches: [
        { ...context.stitches[0]!, paletteItemId: "palette-cloth" },
      ],
    }),
  );
});

test("rejects coordinates outside the canonical zero-based grid", () => {
  const context = validContext();
  expectCode("INVALID_STITCH", () =>
    validateCanonicalPatternVersion({
      ...context,
      stitches: [{ ...context.stitches[0]!, x: 7 }],
    }),
  );
});

test("keeps Project lifecycle separate from Pattern content", () => {
  assert.doesNotThrow(() =>
    validateProject({
      id: "project-1",
      patternVersionId: null,
      importJobId: "import-1",
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "importing",
    }),
  );
  assert.doesNotThrow(() =>
    validateProject({
      id: "project-1",
      patternVersionId: "pattern-version-1",
      importJobId: "import-1",
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "ready",
    }),
  );
});

test("rebuilds progress from ordered events without mutating Pattern", () => {
  const pattern = validContext().pattern;
  const events: ProgressEvent[] = [
    {
      schemaVersion: 1,
      id: "event-1",
      projectId: "project-1",
      patternVersionId: "pattern-version-1",
      localSequence: 1,
      type: "mark",
      targetStitchId: "stitch-1",
      occurredAt: timestamp,
      deviceId: "device-1",
      source: "user",
    },
    {
      schemaVersion: 1,
      id: "event-2",
      projectId: "project-1",
      patternVersionId: "pattern-version-1",
      localSequence: 2,
      type: "unmark",
      targetStitchId: "stitch-1",
      occurredAt: timestamp,
      deviceId: "device-1",
      source: "user",
    },
  ];

  const state = rebuildProgressState(
    events,
    "project-1",
    "pattern-version-1",
  );
  assert.equal(state.get("stitch-1"), "unmarked");
  assert.equal(pattern.id, "pattern-1");
});

test("rejects out-of-order and cross-version progress", () => {
  const base: ProgressEvent = {
    schemaVersion: 1,
    id: "event-1",
    projectId: "project-1",
    patternVersionId: "pattern-version-1",
    localSequence: 1,
    type: "mark",
    targetStitchId: "stitch-1",
    occurredAt: timestamp,
    deviceId: "device-1",
    source: "user",
  };
  expectCode("PROGRESS_SEQUENCE_INVALID", () =>
    rebuildProgressState(
      [base, { ...base, id: "event-2", localSequence: 1 }],
      "project-1",
      "pattern-version-1",
    ),
  );
  expectCode("PROGRESS_CONTEXT_MISMATCH", () =>
    rebuildProgressState(
      [{ ...base, patternVersionId: "pattern-version-2" }],
      "project-1",
      "pattern-version-1",
    ),
  );
});

test("rejects an invalid persisted progress event discriminant", () => {
  const context = validContext();
  assert.throws(
    () =>
      rebuildProgressState(
        [
          {
            schemaVersion: 1,
            id: "event-corrupt",
            projectId: "project-1",
            patternVersionId: context.patternVersion.id,
            localSequence: 1,
            type: "corrupt",
            targetStitchId: context.stitches[0]!.id,
            occurredAt: timestamp,
            deviceId: "device-1",
            source: "user",
          } as unknown as ProgressEvent,
        ],
        "project-1",
        context.patternVersion.id,
      ),
    (error: unknown) =>
      error instanceof DomainValidationError &&
      error.code === "INVALID_PROGRESS_EVENT",
  );
});
