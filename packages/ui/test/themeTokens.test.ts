import { describe, expect, test } from "vitest";
import {
  DEFAULT_THEME_TOKENS,
  resolveThemeTokens,
  toThemeStyleMap
} from "../src/theme/tokens";

describe("resolveThemeTokens", () => {
  test("merges tone defaults and explicit overrides", () => {
    const tokens = resolveThemeTokens("ocean", {
      radius: "20px",
      accent: "#00ffaa"
    });

    expect(tokens.radius).toBe("20px");
    expect(tokens.accent).toBe("#00ffaa");
    expect(tokens.controlText).toBe(DEFAULT_THEME_TOKENS.controlText);
  });
});

describe("toThemeStyleMap", () => {
  test("maps token keys into css variable keys", () => {
    const map = toThemeStyleMap(DEFAULT_THEME_TOKENS);

    expect(map["--fx-panel-bg"]).toBe(DEFAULT_THEME_TOKENS.panelBackground);
    expect(map["--fx-radius"]).toBe(DEFAULT_THEME_TOKENS.radius);
  });
});
