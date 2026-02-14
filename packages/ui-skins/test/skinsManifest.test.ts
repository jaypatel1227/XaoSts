import { describe, expect, test } from "vitest";
import { FRACTAL_SKINS } from "../src";

describe("FRACTAL_SKINS", () => {
  test("contains declared preset entrypoints", () => {
    expect(FRACTAL_SKINS).toHaveLength(2);
    expect(FRACTAL_SKINS.map((skin) => skin.cssEntrypoint)).toEqual([
      "@xaosts/ui-skins/wireframe.css",
      "@xaosts/ui-skins/liquid-glass.css"
    ]);
  });
});
