import type {
  EngineState,
  FractalConfig,
  RenderMode,
  ZoomController
} from "@xaosts/core";

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
  lastFrameTime: number | null;
  renderMode: RenderMode;
  fractal: FractalConfig;
  pointer: PointerState;
}

const MIN_INTERACTION_FRAME_MS = 33;
const INTERACTION_RENDER_SCALE = 0.25;

interface StagingBuffer {
  width: number;
  height: number;
  imageData: ImageData;
  buffer: Uint32Array;
}

export function createCanvasZoomController(
  canvas: HTMLCanvasElement,
  fractal: FractalConfig
): ZoomController {
  const state: ControllerState = {
    started: false,
    stopped: false,
    frameRequest: null,
    lastFrameTime: null,
    renderMode: "approximation",
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
  const stagingCanvas = document.createElement("canvas");
  const stagingContext = stagingCanvas.getContext("2d");
  if (!stagingContext) {
    throw new Error("Could not acquire staging 2D canvas context.");
  }
  let stagingBuffer: StagingBuffer | null = null;
  let lastInteractiveRenderTime = 0;

  const getStagingBuffer = (width: number, height: number): StagingBuffer => {
    if (
      stagingBuffer &&
      stagingBuffer.width === width &&
      stagingBuffer.height === height
    ) {
      return stagingBuffer;
    }

    const imageData = stagingContext.createImageData(width, height);
    stagingBuffer = {
      width,
      height,
      imageData,
      buffer: new Uint32Array(imageData.data.buffer)
    };

    return stagingBuffer;
  };

  const hasActivePointer = (): boolean =>
    state.pointer.button[0] || state.pointer.button[1] || state.pointer.button[2];

  const convertArea = () => {
    const radius = state.fractal.region.radius;
    const center = state.fractal.region.center;
    const aspect = canvas.width / canvas.height;
    const size = Math.max(radius.x, radius.y * aspect);
    const halfWidth = size / 2;
    const halfHeight = size / (2 * aspect);

    return {
      begin: {
        x: center.x - halfWidth,
        y: center.y - halfHeight
      },
      end: {
        x: center.x + halfWidth,
        y: center.y + halfHeight
      }
    };
  };

  const render = (interactive = false): void => {
    const area = convertArea();
    const useApproximation = state.renderMode === "approximation";
    const scale = interactive && useApproximation ? INTERACTION_RENDER_SCALE : 1;
    const width = Math.max(1, Math.floor(canvas.width * scale));
    const height = Math.max(1, Math.floor(canvas.height * scale));
    const targetBuffer = getStagingBuffer(width, height);
    const imageData = targetBuffer.imageData;
    const buffer = targetBuffer.buffer;
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

    if (stagingCanvas.width !== width || stagingCanvas.height !== height) {
      stagingCanvas.width = width;
      stagingCanvas.height = height;
    }
    stagingContext.putImageData(imageData, 0, 0);
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(stagingCanvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
  };

  const updateRegion = (deltaMs: number): void => {
    const zoomRatePerSecond = 4.2;
    const mul = 0.3;
    const area = convertArea();
    const pointer = state.pointer;
    const x = area.begin.x + pointer.x * ((area.end.x - area.begin.x) / canvas.width);
    const y = area.begin.y + pointer.y * ((area.end.y - area.begin.y) / canvas.height);
    const deltax = (pointer.oldx - pointer.x) * ((area.end.x - area.begin.x) / canvas.width);
    const deltay = (pointer.oldy - pointer.y) * ((area.end.y - area.begin.y) / canvas.height);

    let zoomDirection = 0;
    if (pointer.button[1] || (pointer.button[0] && pointer.button[2])) {
      zoomDirection = 0;
    } else if (pointer.button[0]) {
      zoomDirection = 1;
    } else if (pointer.button[2]) {
      zoomDirection = -1;
    } else {
      return;
    }

    const dtSeconds = Math.min(deltaMs, 50) / 1000;
    const zoomScale = Math.exp(-zoomDirection * zoomRatePerSecond * dtSeconds);
    const mmul = Math.pow(zoomScale, mul);
    area.begin.x = x + (area.begin.x - x + deltax) * mmul;
    area.end.x = x + (area.end.x - x + deltax) * mmul;
    area.begin.y = y + (area.begin.y - y + deltay) * mmul;
    area.end.y = y + (area.end.y - y + deltay) * mmul;
    state.fractal.region.radius.x = area.end.x - area.begin.x;
    state.fractal.region.radius.y = area.end.y - area.begin.y;
    state.fractal.region.center.x = (area.begin.x + area.end.x) / 2;
    state.fractal.region.center.y = (area.begin.y + area.end.y) / 2;
    pointer.oldx = pointer.x;
    pointer.oldy = pointer.y;
  };

  const animationLoop = (timestamp: number): void => {
    if (state.stopped) {
      return;
    }

    const previousTime = state.lastFrameTime ?? timestamp;
    const deltaMs = timestamp - previousTime;
    state.lastFrameTime = timestamp;

    if (hasActivePointer()) {
      updateRegion(deltaMs);
      const minFrameMs = state.renderMode === "approximation" ? MIN_INTERACTION_FRAME_MS : 0;
      if (timestamp - lastInteractiveRenderTime >= minFrameMs) {
        render(true);
        lastInteractiveRenderTime = timestamp;
      }
    }
    state.frameRequest = requestAnimationFrame(animationLoop);
  };

  const syncPointerPosition = (e: MouseEvent): void => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = e.clientX - rect.left;
    state.pointer.y = e.clientY - rect.top;
  };

  const onMouseDown = (e: MouseEvent): void => {
    state.pointer.button[e.button] = true;
    syncPointerPosition(e);
    state.pointer.oldx = state.pointer.x;
    state.pointer.oldy = state.pointer.y;
  };

  const onMouseUp = (e: MouseEvent): void => {
    state.pointer.button[e.button] = false;
    if (!hasActivePointer()) {
      render();
    }
  };

  const onMouseMove = (e: MouseEvent): void => {
    syncPointerPosition(e);
  };

  const onMouseOut = (): void => {
    state.pointer.button = [false, false, false];
    render();
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
    render();
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
      state.lastFrameTime = null;
      lastInteractiveRenderTime = 0;
      render();
      state.frameRequest = requestAnimationFrame(animationLoop);
    },

    stop(): void {
      state.stopped = true;
      if (state.frameRequest !== null) {
        cancelAnimationFrame(state.frameRequest);
        state.frameRequest = null;
      }
      state.lastFrameTime = null;
      lastInteractiveRenderTime = 0;
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

    setRenderMode(mode: RenderMode): void {
      if (state.renderMode === mode) {
        return;
      }
      state.renderMode = mode;
      render();
    },

    getRenderMode(): RenderMode {
      return state.renderMode;
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
