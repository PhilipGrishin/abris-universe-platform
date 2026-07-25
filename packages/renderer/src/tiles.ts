import type { FullCrossStitch } from "@abris-universe/domain-core";
import {
  INITIAL_TILE_SIZE,
  type PatternTile,
  type TileRange,
} from "./contracts.ts";

export function tileKey(tileX: number, tileY: number): string {
  return `${tileY}:${tileX}`;
}

export function buildPatternTiles(
  patternVersionId: string,
  stitches: readonly FullCrossStitch[],
  tileSize = INITIAL_TILE_SIZE,
): readonly PatternTile[] {
  if (
    patternVersionId.trim().length === 0 ||
    !Number.isSafeInteger(tileSize) ||
    tileSize <= 0
  ) {
    throw new TypeError("Pattern version and positive tile size are required.");
  }
  const grouped = new Map<string, FullCrossStitch[]>();
  for (const stitch of stitches) {
    const tileX = Math.floor(stitch.x / tileSize);
    const tileY = Math.floor(stitch.y / tileSize);
    const key = tileKey(tileX, tileY);
    const tile = grouped.get(key) ?? [];
    tile.push(stitch);
    grouped.set(key, tile);
  }
  return [...grouped.entries()]
    .map(([key, tileStitches]) => {
      const [tileYText, tileXText] = key.split(":");
      const tileY = Number(tileYText);
      const tileX = Number(tileXText);
      return {
        patternVersionId,
        tileY,
        tileX,
        stitches: [...tileStitches].sort((left, right) => {
          const leftIndex =
            (left.y % tileSize) * tileSize + (left.x % tileSize);
          const rightIndex =
            (right.y % tileSize) * tileSize + (right.x % tileSize);
          return leftIndex - rightIndex || left.id.localeCompare(right.id);
        }),
      };
    })
    .sort(
      (left, right) =>
        left.tileY - right.tileY || left.tileX - right.tileX,
    );
}

export function tileInRange(tile: PatternTile, range: TileRange): boolean {
  return (
    tile.tileX >= range.minTileX &&
    tile.tileX <= range.maxTileX &&
    tile.tileY >= range.minTileY &&
    tile.tileY <= range.maxTileY
  );
}
