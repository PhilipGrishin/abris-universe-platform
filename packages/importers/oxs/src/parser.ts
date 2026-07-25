import { SaxesParser, type SaxesTagPlain } from "saxes";

import { OXS_LIMITS, type OxsParserLimits } from "./limits.ts";

export interface ParsedOxsPaletteItem {
  readonly index: string | undefined;
  readonly number: string | undefined;
  readonly name: string | undefined;
  readonly color: string | undefined;
  readonly strands: string | undefined;
  readonly symbol: string | undefined;
}

export interface ParsedOxsStitch {
  readonly x: string | undefined;
  readonly y: string | undefined;
  readonly palindex: string | undefined;
  readonly marked: string | undefined;
}

export interface ParsedOxsDocument {
  readonly properties: Readonly<Record<string, string>>;
  readonly paletteItems: readonly ParsedOxsPaletteItem[];
  readonly stitches: readonly ParsedOxsStitch[];
  readonly unsupportedByKind: Readonly<Record<string, number>>;
}

export class OxsParseFailure extends Error {
  readonly code: string;
  readonly location: string | null;
  readonly details: Readonly<Record<string, string | number | boolean>>;

  constructor(
    code: string,
    message: string,
    location: string | null = null,
    details: Readonly<Record<string, string | number | boolean>> = {},
  ) {
    super(message);
    this.name = "OxsParseFailure";
    this.code = code;
    this.location = location;
    this.details = details;
  }
}

const METADATA_ATTRIBUTES = new Set([
  "charttitle",
  "author",
  "copyright",
  "instructions",
]);

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function increment(
  record: Record<string, number>,
  key: string,
  currentTotal: number,
  limit: number,
): number {
  const next = (record[key] ?? 0) + 1;
  const nextTotal = currentTotal + 1;
  if (nextTotal > limit) {
    throw new OxsParseFailure(
      "OXS_LIMIT_UNSUPPORTED",
      "Unsupported object limit exceeded.",
      key,
    );
  }
  record[key] = next;
  return nextTotal;
}

function location(parser: SaxesParser<{ xmlns: false }>): string {
  return `line:${parser.line}:column:${parser.column}`;
}

export function parseOxsDocument(
  text: string,
  limits: OxsParserLimits = OXS_LIMITS,
): ParsedOxsDocument {
  if (/<!DOCTYPE/iu.test(text)) {
    throw new OxsParseFailure(
      "OXS_DTD_FORBIDDEN",
      "DOCTYPE and DTD declarations are forbidden.",
    );
  }

  const properties: Record<string, string> = {};
  const paletteItems: ParsedOxsPaletteItem[] = [];
  const stitches: ParsedOxsStitch[] = [];
  const unsupportedByKind: Record<string, number> = {};
  const stack: string[] = [];
  const sectionCounts = new Map<string, number>();
  let elementCount = 0;
  let retainedExtensionBytes = 0;
  let unsupportedTotal = 0;
  let sawRoot = false;

  const parser = new SaxesParser({ xmlns: false, position: true });

  parser.on("xmldecl", ({ version, encoding }) => {
    if (
      version !== "1.0" ||
      (encoding !== undefined && encoding.toUpperCase() !== "UTF-8")
    ) {
      throw new OxsParseFailure(
        "OXS_XML_DECLARATION_UNSUPPORTED",
        "Only XML 1.0 encoded as UTF-8 is supported.",
        location(parser),
      );
    }
  });
  parser.on("doctype", () => {
    throw new OxsParseFailure(
      "OXS_DTD_FORBIDDEN",
      "DOCTYPE and DTD declarations are forbidden.",
      location(parser),
    );
  });
  parser.on("processinginstruction", ({ target }) => {
    if (target.toLowerCase() !== "xml") {
      throw new OxsParseFailure(
        "OXS_PROCESSING_INSTRUCTION_FORBIDDEN",
        "Processing instructions are forbidden.",
        location(parser),
      );
    }
  });
  parser.on("error", () => {
    throw new OxsParseFailure(
      "OXS_XML_MALFORMED",
      "The OXS document is not well-formed XML.",
      location(parser),
    );
  });
  parser.on("opentag", (tag: SaxesTagPlain) => {
    elementCount += 1;
    if (elementCount > limits.maxElements) {
      throw new OxsParseFailure(
        "OXS_LIMIT_ELEMENTS",
        "XML element limit exceeded.",
        location(parser),
      );
    }

    stack.push(tag.name);
    if (stack.length > limits.maxXmlDepth) {
      throw new OxsParseFailure(
        "OXS_LIMIT_XML_DEPTH",
        "XML nesting-depth limit exceeded.",
        location(parser),
      );
    }
    if (
      utf8Bytes(tag.name) > 128 ||
      tag.name !== tag.name.toLowerCase() ||
      tag.name.includes(":")
    ) {
      throw new OxsParseFailure(
        "OXS_STRUCTURE_INVALID",
        "OXS element names must be lowercase and unqualified.",
        location(parser),
      );
    }

    const attributes = tag.attributes;
    const attributeEntries = Object.entries(attributes);
    if (attributeEntries.length > limits.maxAttributesPerElement) {
      throw new OxsParseFailure(
        "OXS_LIMIT_ATTRIBUTES",
        "XML attribute-count limit exceeded.",
        location(parser),
      );
    }
    for (const [name, value] of attributeEntries) {
      if (
        utf8Bytes(name) > 128 ||
        name !== name.toLowerCase() ||
        name.includes(":")
      ) {
        throw new OxsParseFailure(
          "OXS_STRUCTURE_INVALID",
          "OXS attribute names must be lowercase and unqualified.",
          location(parser),
        );
      }
      const valueBytes = utf8Bytes(value);
      if (valueBytes > limits.maxAttributeBytes) {
        throw new OxsParseFailure(
          "OXS_LIMIT_ATTRIBUTE_BYTES",
          "XML attribute-value limit exceeded.",
          location(parser),
        );
      }
      if (METADATA_ATTRIBUTES.has(name) && valueBytes > limits.maxMetadataBytes) {
        throw new OxsParseFailure(
          "OXS_LIMIT_METADATA_BYTES",
          "Metadata value limit exceeded.",
          location(parser),
        );
      }
    }

    const path = stack.join("/");
    if (stack.length === 1) {
      if (tag.name !== "chart" || sawRoot) {
        throw new OxsParseFailure(
          "OXS_ROOT_INVALID",
          "The OXS root element must be chart.",
          location(parser),
        );
      }
      sawRoot = true;
      return;
    }

    if (stack.length === 2) {
      sectionCounts.set(tag.name, (sectionCounts.get(tag.name) ?? 0) + 1);
    }

    if (path === "chart/properties") {
      Object.assign(properties, attributes);
      return;
    }
    if (path === "chart/palette/palette_item") {
      paletteItems.push({
        index: attributes.index,
        number: attributes.number,
        name: attributes.name,
        color: attributes.color,
        strands: attributes.strands,
        symbol: attributes.symbol,
      });
      if (paletteItems.length > limits.maxPaletteEntries) {
        throw new OxsParseFailure(
          "OXS_LIMIT_PALETTE",
          "Palette-entry limit exceeded.",
          location(parser),
        );
      }
      return;
    }
    if (path === "chart/fullstitches/stitch") {
      stitches.push({
        x: attributes.x,
        y: attributes.y,
        palindex: attributes.palindex,
        marked: attributes.marked,
      });
      if (stitches.length > limits.maxFullCrossStitches) {
        throw new OxsParseFailure(
          "OXS_LIMIT_STITCHES",
          "Full-cross stitch limit exceeded.",
          location(parser),
        );
      }
      return;
    }
    if (path === "chart/partstitches/partstitch") {
      unsupportedTotal = increment(
        unsupportedByKind,
        "partstitches",
        unsupportedTotal,
        limits.maxUnsupportedObjects,
      );
      return;
    }
    if (path === "chart/backstitches/backstitch") {
      unsupportedTotal = increment(
        unsupportedByKind,
        "backstitches",
        unsupportedTotal,
        limits.maxUnsupportedObjects,
      );
      return;
    }
    if (path === "chart/ornaments_inc_knots_and_beads/object") {
      unsupportedTotal = increment(
        unsupportedByKind,
        "objects",
        unsupportedTotal,
        limits.maxUnsupportedObjects,
      );
      return;
    }

    const knownContainers = new Set([
      "chart/format",
      "chart/palette",
      "chart/fullstitches",
      "chart/partstitches",
      "chart/backstitches",
      "chart/ornaments_inc_knots_and_beads",
      "chart/commentboxes",
    ]);
    if (!knownContainers.has(path) && path !== "chart/properties") {
      unsupportedTotal = increment(
        unsupportedByKind,
        `extension:${tag.name}`,
        unsupportedTotal,
        limits.maxUnsupportedObjects,
      );
    }

    retainedExtensionBytes +=
      utf8Bytes(tag.name) +
      attributeEntries.reduce(
        (sum, [name, value]) => sum + utf8Bytes(name) + utf8Bytes(value),
        0,
      );
    if (retainedExtensionBytes > limits.maxRetainedExtensionBytes) {
      throw new OxsParseFailure(
        "OXS_LIMIT_EXTENSION_BYTES",
        "Retained extension-metadata limit exceeded.",
        location(parser),
      );
    }
  });
  parser.on("text", (value) => {
    if (value.trim().length === 0) return;
    const valueBytes = utf8Bytes(value);
    if (valueBytes > limits.maxMetadataBytes) {
      throw new OxsParseFailure(
        "OXS_LIMIT_METADATA_BYTES",
        "Metadata text-value limit exceeded.",
        location(parser),
      );
    }
    retainedExtensionBytes += valueBytes;
    if (retainedExtensionBytes > limits.maxRetainedExtensionBytes) {
      throw new OxsParseFailure(
        "OXS_LIMIT_EXTENSION_BYTES",
        "Retained extension-metadata limit exceeded.",
        location(parser),
      );
    }
  });
  parser.on("cdata", (value) => {
    retainedExtensionBytes += utf8Bytes(value);
    if (retainedExtensionBytes > limits.maxRetainedExtensionBytes) {
      throw new OxsParseFailure(
        "OXS_LIMIT_EXTENSION_BYTES",
        "Retained extension-metadata limit exceeded.",
        location(parser),
      );
    }
  });
  parser.on("comment", (value) => {
    retainedExtensionBytes += utf8Bytes(value);
    if (retainedExtensionBytes > limits.maxRetainedExtensionBytes) {
      throw new OxsParseFailure(
        "OXS_LIMIT_EXTENSION_BYTES",
        "Retained extension-metadata limit exceeded.",
        location(parser),
      );
    }
  });
  parser.on("closetag", () => {
    stack.pop();
  });

  try {
    const chunkSize = 64 * 1024;
    for (let offset = 0; offset < text.length; offset += chunkSize) {
      parser.write(text.slice(offset, offset + chunkSize));
    }
    parser.close();
  } catch (error) {
    if (error instanceof OxsParseFailure) throw error;
    throw new OxsParseFailure(
      "OXS_XML_MALFORMED",
      "The OXS document is not well-formed XML.",
      location(parser),
    );
  }

  if (!sawRoot) {
    throw new OxsParseFailure("OXS_ROOT_INVALID", "Missing chart root.");
  }
  for (const section of ["properties", "fullstitches", "backstitches"]) {
    if (sectionCounts.get(section) !== 1) {
      throw new OxsParseFailure(
        "OXS_REQUIRED_SECTION_INVALID",
        `Required section ${section} must occur exactly once.`,
        `chart/${section}`,
      );
    }
  }

  return {
    properties,
    paletteItems,
    stitches,
    unsupportedByKind,
  };
}
