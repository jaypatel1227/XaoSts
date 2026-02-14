import type { FractalConfig } from "../core/types";

declare global {
  interface Window {
    xaos?: {
      zoom?: (canvas: HTMLCanvasElement, fractal: FractalConfig) => void;
    };
  }
}

export {};
