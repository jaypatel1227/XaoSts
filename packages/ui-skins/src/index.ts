export type FractalPresetSkin = "wireframe" | "liquid-glass";

export interface FractalSkinDescriptor {
  name: FractalPresetSkin;
  cssEntrypoint: string;
  description: string;
}

export const FRACTAL_SKINS: ReadonlyArray<FractalSkinDescriptor> = [
  {
    name: "wireframe",
    cssEntrypoint: "@xaosts/ui-skins/wireframe.css",
    description: "Angular line-grid shell with neon edge highlights"
  },
  {
    name: "liquid-glass",
    cssEntrypoint: "@xaosts/ui-skins/liquid-glass.css",
    description: "Soft translucent surfaces with shimmer and depth"
  }
] as const;
