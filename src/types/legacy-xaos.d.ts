import type { FractalConfig } from "../core/types";

declare global {
  interface Window {
    __XAOS_DISABLE_AUTOBOOT__?: boolean;
    xaos?: {
      zoom?: (canvas: HTMLCanvasElement, fractal: FractalConfig) => void;
    };
  }
}

export {};
