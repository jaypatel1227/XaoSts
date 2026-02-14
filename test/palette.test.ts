import { describe, expect, it } from "vitest";
import { createDefaultPalette } from "../src/core/palette";

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
});
