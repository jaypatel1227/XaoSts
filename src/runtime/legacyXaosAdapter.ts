import type { EngineState, FractalConfig, ZoomController } from "../core/types";

interface LegacyZoomState {
  started: boolean;
  stopped: boolean;
  fractal: FractalConfig;
}

export function createLegacyZoomController(
  canvas: HTMLCanvasElement,
  fractal: FractalConfig
): ZoomController {
  const state: LegacyZoomState = {
    started: false,
    stopped: false,
    fractal
  };

  const ensureLegacyRuntime = (): void => {
    if (typeof window.xaos?.zoom !== "function") {
      throw new Error("Legacy xaos runtime is not loaded. Include /js/xaos.js before main.ts.");
    }
  };

  return {
    start(): void {
      if (state.started) {
        return;
      }

      ensureLegacyRuntime();
      window.xaos!.zoom!(canvas, state.fractal);
      state.started = true;
      state.stopped = false;
    },

    stop(): void {
      // Legacy runtime does not expose a pause API yet.
      state.stopped = true;
    },

    resize(width: number, height: number): void {
      canvas.width = width;
      canvas.height = height;
    },

    setFractal(config: FractalConfig): void {
      state.fractal = config;
    },

    getState(): EngineState {
      return {
        zooming: state.started && !state.stopped,
        incomplete: false
      };
    },

    dispose(): void {
      state.stopped = true;
    }
  };
}
