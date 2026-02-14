import { createMandelbrot, type FractalConfig, type RenderMode } from "@xaosts/core";
import { useEffect, useRef } from "react";
import type { FractalCanvasController } from "../types";
import { createCanvasFractalController } from "./createCanvasFractalController";

export interface UseFractalCanvasControllerOptions {
  fractal?: FractalConfig;
  renderMode?: RenderMode;
  autoStart?: boolean;
  onControllerReady?: (controller: FractalCanvasController) => void;
}

export interface UseFractalCanvasControllerResult {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  controllerRef: React.MutableRefObject<FractalCanvasController | null>;
}

export function useFractalCanvasController(
  options: UseFractalCanvasControllerOptions = {}
): UseFractalCanvasControllerResult {
  const { autoStart = true, fractal, onControllerReady, renderMode } = options;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<FractalCanvasController | null>(null);
  const defaultFractalRef = useRef<FractalConfig>(createMandelbrot());

  const resolvedFractal = fractal ?? defaultFractalRef.current;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || controllerRef.current) {
      return;
    }

    const controller = createCanvasFractalController(canvas, {
      fractal: resolvedFractal,
      ...(renderMode ? { renderMode } : {})
    });
    controllerRef.current = controller;

    if (autoStart) {
      controller.start();
    }

    if (onControllerReady) {
      onControllerReady(controller);
    }

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [autoStart, onControllerReady, renderMode, resolvedFractal]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    controller.setFractal(resolvedFractal);
  }, [resolvedFractal]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || !renderMode) {
      return;
    }

    controller.setRenderMode(renderMode);
  }, [renderMode]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    if (autoStart) {
      controller.start();
      return;
    }

    controller.stop();
  }, [autoStart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const controller = controllerRef.current;
    if (!canvas || !controller || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width > 0 && height > 0) {
        controller.resize(width, height);
      }
    });

    observer.observe(canvas);
    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    canvasRef,
    controllerRef
  };
}
