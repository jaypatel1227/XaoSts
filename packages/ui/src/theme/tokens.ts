export interface FractalThemeTokens {
  panelBackground: string;
  panelBorder: string;
  controlBackground: string;
  controlBorder: string;
  controlText: string;
  accent: string;
  shadow: string;
  backdropBlur: string;
  radius: string;
}

export type FractalThemeTone = "neutral" | "ocean" | "sunset";

export const DEFAULT_THEME_TOKENS: FractalThemeTokens = {
  panelBackground: "rgba(6, 10, 15, 0.42)",
  panelBorder: "rgba(186, 215, 240, 0.26)",
  controlBackground: "rgba(9, 16, 24, 0.5)",
  controlBorder: "rgba(196, 223, 247, 0.3)",
  controlText: "#ecf5ff",
  accent: "#86b8ff",
  shadow: "rgba(3, 8, 14, 0.5)",
  backdropBlur: "16px",
  radius: "14px"
};

const TONE_OVERRIDES: Record<FractalThemeTone, Partial<FractalThemeTokens>> = {
  neutral: {},
  ocean: {
    accent: "#58d4ff",
    panelBorder: "rgba(114, 219, 255, 0.32)",
    controlBorder: "rgba(114, 219, 255, 0.4)"
  },
  sunset: {
    accent: "#ffab77",
    panelBorder: "rgba(255, 184, 133, 0.32)",
    controlBorder: "rgba(255, 184, 133, 0.4)"
  }
};

export type ThemeStyleMap = Record<`--fx-${string}`, string>;

export function resolveThemeTokens(
  tone: FractalThemeTone,
  overrides: Partial<FractalThemeTokens> = {}
): FractalThemeTokens {
  return {
    ...DEFAULT_THEME_TOKENS,
    ...TONE_OVERRIDES[tone],
    ...overrides
  };
}

export function toThemeStyleMap(tokens: FractalThemeTokens): ThemeStyleMap {
  return {
    "--fx-panel-bg": tokens.panelBackground,
    "--fx-panel-border": tokens.panelBorder,
    "--fx-control-bg": tokens.controlBackground,
    "--fx-control-border": tokens.controlBorder,
    "--fx-control-text": tokens.controlText,
    "--fx-accent": tokens.accent,
    "--fx-shadow": tokens.shadow,
    "--fx-backdrop-blur": tokens.backdropBlur,
    "--fx-radius": tokens.radius
  };
}
