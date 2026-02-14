import { describe, expect, it } from "vitest";
import { createDefaultPalette } from "../src/palette";

describe("createDefaultPalette", () => {
  it("returns the expected palette size", () => {
    const palette = createDefaultPalette();
    expect(palette).toBeInstanceOf(Uint32Array);
    expect(palette.length).toBe(65536);
  });

  it("is deterministic", () => {
    const first = createDefaultPalette();
    const second = createDefaultPalette();
    expect(first).toEqual(second);
  });

  it("encodes fully opaque colors", () => {
    const palette = createDefaultPalette();
    const firstAlpha = (palette[0]! >>> 24) & 0xff;
    const middleAlpha = (palette[Math.floor(palette.length / 2)]! >>> 24) & 0xff;
    const lastAlpha = (palette[palette.length - 1]! >>> 24) & 0xff;
    expect(firstAlpha).toBe(255);
    expect(middleAlpha).toBe(255);
    expect(lastAlpha).toBe(255);
  });
});
