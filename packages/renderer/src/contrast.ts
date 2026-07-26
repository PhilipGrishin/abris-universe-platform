function channelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: `#${string}`): number {
  if (!/^#[A-F0-9]{6}$/u.test(color)) {
    throw new TypeError("Color must be normalized #RRGGBB.");
  }
  const red = channelToLinear(Number.parseInt(color.slice(1, 3), 16));
  const green = channelToLinear(Number.parseInt(color.slice(3, 5), 16));
  const blue = channelToLinear(Number.parseInt(color.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(
  firstLuminance: number,
  secondLuminance: number,
): number {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function readableGlyphColor(color: `#${string}`): "#000000" | "#FFFFFF" {
  const background = relativeLuminance(color);
  return contrastRatio(background, 0) >= contrastRatio(background, 1)
    ? "#000000"
    : "#FFFFFF";
}
