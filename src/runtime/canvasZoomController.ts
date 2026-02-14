import type { EngineState, FractalConfig, ZoomController } from "../core/types";

interface PointerState {
  x: number;
  y: number;
  oldx: number;
  oldy: number;
  button: [boolean, boolean, boolean];
}

interface ControllerState {
  started: boolean;
  stopped: boolean;
  frameRequest: number | null;
  fractal: FractalConfig;
  pointer: PointerState;
}

export function createCanvasZoomController(
  canvas: HTMLCanvasElement,
  fractal: FractalConfig
): ZoomController {
  const state: ControllerState = {
    started: false,
    stopped: false,
    frameRequest: null,
    fractal,
    pointer: {
      x: 0,
      y: 0,
      oldx: 0,
      oldy: 0,
      button: [false, false, false]
    }
  };

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not acquire 2D canvas context.");
  }

  const hasActivePointer = (): boolean =>
    state.pointer.button[0] || state.pointer.button[1] || state.pointer.button[2];

  const convertArea = () => {
    const radius = state.fractal.region.radius;
    const center = state.fractal.region.center;
    const aspect = canvas.width / canvas.height;
    const size = Math.max(radius.x, radius.y * aspect);
    return {
      begin: {
        x: center.x - size / 2,
        y: (center.y - size / 2) / aspect
      },
      end: {
        x: center.x + size / 2,
        y: (center.y + size / 2) / aspect
      }
    };
  };

  const render = (): void => {
    const area = convertArea();
    const width = canvas.width;
    const height = canvas.height;
    const imageData = context.createImageData(width, height);
    const buffer = new Uint32Array(imageData.data.buffer);
    const stepx = (area.end.x - area.begin.x) / width;
    const stepy = (area.end.y - area.begin.y) / height;

    let rowOffset = 0;
    for (let py = 0; py < height; py += 1) {
      const ci = area.begin.y + py * stepy;
      for (let px = 0; px < width; px += 1) {
        const cr = area.begin.x + px * stepx;
        buffer[rowOffset + px] = state.fractal.formula.call(state.fractal, cr, ci);
      }
      rowOffset += width;
    }

    context.putImageData(imageData, 0, 0);
  };

  const updateRegion = (): void => {
    const maxStep = 0.008 * 3;
    const mul = 0.3;
    const area = convertArea();
    const pointer = state.pointer;
    const x = area.begin.x + pointer.x * ((area.end.x - area.begin.x) / canvas.width);
    const y = area.begin.y + pointer.y * ((area.end.y - area.begin.y) / canvas.height);
    const deltax = (pointer.oldx - pointer.x) * ((area.end.x - area.begin.x) / canvas.width);
    const deltay = (pointer.oldy - pointer.y) * ((area.end.y - area.begin.y) / canvas.height);

    let step: number;
    if (pointer.button[1] || (pointer.button[0] && pointer.button[2])) {
      step = 0;
    } else if (pointer.button[0]) {
      step = maxStep * 2;
    } else if (pointer.button[2]) {
      step = -maxStep * 2;
    } else {
      return;
    }

    const mmul = Math.pow(1 - step, mul);
    area.begin.x = x + (area.begin.x - x + deltax) * mmul;
    area.end.x = x + (area.end.x - x + deltax) * mmul;
    area.begin.y = y + (area.begin.y - y + deltay) * mmul;
    area.end.y = y + (area.end.y - y + deltay) * mmul;
    state.fractal.region.radius.x = area.end.x - area.begin.x;
    state.fractal.region.radius.y = area.end.y - area.begin.y;
    state.fractal.region.center.x = (area.begin.x + area.end.x) / 2;
    state.fractal.region.center.y = ((area.begin.y + area.end.y) / 2) * (canvas.width / canvas.height);
    pointer.oldx = pointer.x;
    pointer.oldy = pointer.y;
  };

  const animationLoop = (): void => {
    if (state.stopped) {
      return;
    }
    if (hasActivePointer()) {
      updateRegion();
      render();
    }
    state.frameRequest = requestAnimationFrame(animationLoop);
  };

  const syncPointerPosition = (e: MouseEvent): void => {
    state.pointer.x = e.offsetX || e.clientX - canvas.offsetLeft;
    state.pointer.y = e.offsetY || e.clientY - canvas.offsetTop;
  };

  const onMouseDown = (e: MouseEvent): void => {
    state.pointer.button[e.button] = true;
    syncPointerPosition(e);
    state.pointer.oldx = state.pointer.x;
    state.pointer.oldy = state.pointer.y;
  };

  const onMouseUp = (e: MouseEvent): void => {
    state.pointer.button[e.button] = false;
  };

  const onMouseMove = (e: MouseEvent): void => {
    syncPointerPosition(e);
  };

  const onMouseOut = (): void => {
    state.pointer.button = [false, false, false];
  };

  const onContextMenu = (e: Event): void => {
    e.preventDefault();
  };

  const onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length < 1 || e.touches.length > 2) {
      return;
    }
    const touch = e.touches.item(0);
    if (!touch) {
      return;
    }
    const mouseButton = e.touches.length === 2 ? 2 : 0;
    state.pointer.button[mouseButton] = true;
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = touch.clientX - rect.left;
    state.pointer.y = touch.clientY - rect.top;
    state.pointer.oldx = state.pointer.x;
    state.pointer.oldy = state.pointer.y;
  };

  const onTouchMove = (e: TouchEvent): void => {
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = touch.clientX - rect.left;
    state.pointer.y = touch.clientY - rect.top;
  };

  const onTouchEnd = (): void => {
    state.pointer.button = [false, false, false];
  };

  const attachListeners = (): void => {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseout", onMouseOut);
    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
  };

  const detachListeners = (): void => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseout", onMouseOut);
    canvas.removeEventListener("contextmenu", onContextMenu);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
  };

  const fitToClientSize = (): void => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  return {
    start(): void {
      if (state.started) {
        return;
      }
      fitToClientSize();
      attachListeners();
      state.started = true;
      state.stopped = false;
      render();
      state.frameRequest = requestAnimationFrame(animationLoop);
    },

    stop(): void {
      state.stopped = true;
      if (state.frameRequest !== null) {
        cancelAnimationFrame(state.frameRequest);
        state.frameRequest = null;
      }
    },

    resize(width: number, height: number): void {
      canvas.width = width;
      canvas.height = height;
      render();
    },

    setFractal(config: FractalConfig): void {
      state.fractal = config;
      render();
    },

    getState(): EngineState {
      return {
        zooming: hasActivePointer(),
        incomplete: false
      };
    },

    dispose(): void {
      this.stop();
      detachListeners();
    }
  };
}
