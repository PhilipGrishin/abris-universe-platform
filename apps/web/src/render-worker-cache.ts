const MAX_TILE_CACHE_EDGE_DEVICE_PX = 2_048;
const MAX_TILE_CACHE_BYTES = 128 * 1024 * 1024;

export interface TileRasterIdentity {
  readonly patternVersionId: string;
  readonly tileX: number;
  readonly tileY: number;
  readonly tileSize: number;
  readonly cellSize: number;
  readonly devicePixelRatio: number;
  readonly readable: boolean;
}

export function tileRasterEdgeDevicePx(
  tileSize: number,
  cellSize: number,
  devicePixelRatio: number,
): number {
  return Math.max(1, Math.ceil(tileSize * cellSize * devicePixelRatio));
}

export function tileRasterBytes(edgeDevicePx: number): number {
  return edgeDevicePx * edgeDevicePx * 4;
}

export function tileRasterCacheable(edgeDevicePx: number): boolean {
  return (
    Number.isSafeInteger(edgeDevicePx) &&
    edgeDevicePx > 0 &&
    edgeDevicePx <= MAX_TILE_CACHE_EDGE_DEVICE_PX &&
    tileRasterBytes(edgeDevicePx) <= MAX_TILE_CACHE_BYTES
  );
}

export function tileRasterKey(identity: TileRasterIdentity): string {
  return [
    identity.patternVersionId,
    identity.tileX,
    identity.tileY,
    identity.tileSize,
    Math.round(identity.cellSize * 1_000) / 1_000,
    Math.round(identity.devicePixelRatio * 100) / 100,
    identity.readable ? "readable" : "overview",
  ].join("\u0000");
}

export const TILE_RASTER_CACHE_BYTE_LIMIT = MAX_TILE_CACHE_BYTES;
