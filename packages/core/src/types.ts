export interface Point {
  x: number;
  y: number;
}

export interface Symmetry {
  x: number | null;
  y: number | null;
}

export interface ViewportRegion {
  center: Point;
  radius: Point;
  angle: number;
}

export type PixelColor = number;

export interface FractalConfig {
  symmetry: Symmetry;
  region: ViewportRegion;
  z0: Point;
  maxiter: number;
  bailout: number;
  palette: Uint32Array;
  formula: (this: FractalConfig, cr: number, ci: number) => PixelColor;
}

export interface EngineState {
  zooming: boolean;
  incomplete: boolean;
}

export interface FrameStats {
  fps: number;
  frameTimeMs: number;
  incomplete: boolean;
}

export type RenderMode = "high-fidelity" | "approximation";

export interface ZoomController {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  setFractal(config: FractalConfig): void;
  setRenderMode(mode: RenderMode): void;
  getRenderMode(): RenderMode;
  getState(): EngineState;
  dispose(): void;
}
