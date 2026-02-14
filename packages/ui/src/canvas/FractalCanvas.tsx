import type { FractalConfig, RenderMode } from "@xaosts/core";
import type { FractalCanvasController } from "../types";
import { useFractalCanvasController } from "./useFractalCanvasController";

export interface FractalCanvasProps
  extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, "onChange"> {
  fractal?: FractalConfig;
  renderMode?: RenderMode;
  autoStart?: boolean;
  onControllerReady?: (controller: FractalCanvasController) => void;
}

export function FractalCanvas({
  autoStart = true,
  className,
  fractal,
  onControllerReady,
  renderMode,
  ...canvasProps
}: FractalCanvasProps): React.JSX.Element {
  const controllerOptions = {
    autoStart,
    ...(fractal ? { fractal } : {}),
    ...(renderMode ? { renderMode } : {}),
    ...(onControllerReady ? { onControllerReady } : {})
  };
  const { canvasRef } = useFractalCanvasController(controllerOptions);

  return (
    <canvas
      {...canvasProps}
      ref={canvasRef}
      className={className}
      data-slot="fractal-canvas"
    />
  );
}
