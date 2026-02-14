import type { FractalConfig, RenderMode, ZoomController } from "@xaosts/core";

export type FractalSkinName = "none" | "wireframe" | "liquid-glass";

export interface FractalCanvasController extends ZoomController {
  capturePng(type?: string, quality?: number): string;
  resetView(nextFractal?: FractalConfig): void;
  getCanvasElement(): HTMLCanvasElement;
}

export interface FractalCanvasControllerOptions {
  fractal: FractalConfig;
  renderMode?: RenderMode;
}
