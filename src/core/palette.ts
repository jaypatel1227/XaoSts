export function createDefaultPalette(): Uint32Array {
  const maxEntries = 65536;
  const segmentSize = 8;
  const setSegments = Math.floor((maxEntries + 3) / segmentSize);
  const nSegments = Math.floor(255 / segmentSize);
  const segments: ReadonlyArray<readonly [number, number, number]> = [
    [0, 0, 0],
    [120, 119, 238],
    [24, 7, 25],
    [197, 66, 28],
    [29, 18, 11],
    [135, 46, 71],
    [24, 27, 13],
    [241, 230, 128],
    [17, 31, 24],
    [240, 162, 139],
    [11, 4, 30],
    [106, 87, 189],
    [29, 21, 14],
    [12, 140, 118],
    [10, 6, 29],
    [50, 144, 77],
    [22, 0, 24],
    [148, 188, 243],
    [4, 32, 7],
    [231, 146, 14],
    [10, 13, 20],
    [184, 147, 68],
    [13, 28, 3],
    [169, 248, 152],
    [4, 0, 34],
    [62, 83, 48],
    [7, 21, 22],
    [152, 97, 184],
    [8, 3, 12],
    [247, 92, 235],
    [31, 32, 16]
  ];

  const palette: number[] = [];

  const readSegmentColor = (
    segmentIndex: number,
    channel: 0 | 1 | 2
  ): number => {
    const color = segments[segmentIndex % nSegments];
    if (!color) {
      throw new Error("Palette segment index out of range");
    }
    return color[channel];
  };

  for (let i = 0; i < setSegments; i += 1) {
    let r = readSegmentColor(i, 0);
    let g = readSegmentColor(i, 1);
    let b = readSegmentColor(i, 2);

    const next = (i + 1) % setSegments;
    const rs = (readSegmentColor(next, 0) - r) / segmentSize;
    const gs = (readSegmentColor(next, 1) - g) / segmentSize;
    const bs = (readSegmentColor(next, 2) - b) / segmentSize;

    for (let y = 0; y < segmentSize; y += 1) {
      palette.push((255 << 24) | (b << 16) | (g << 8) | r);
      r += rs;
      g += gs;
      b += bs;
    }
  }

  return new Uint32Array(palette);
}
