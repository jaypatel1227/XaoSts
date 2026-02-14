import { createMandelbrot, type RenderMode } from "@xaosts/core";
import { createCanvasZoomController } from "./runtime/canvasZoomController";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
const captureButton = document.querySelector<HTMLButtonElement>("#captureButton");
const renderModeSelect = document.querySelector<HTMLSelectElement>("#renderModeSelect");

if (!canvas) {
  throw new Error("Missing #canvas element");
}

const fractal = createMandelbrot();
const controller = createCanvasZoomController(canvas, fractal);
controller.start();

if (renderModeSelect) {
  renderModeSelect.value = controller.getRenderMode();
  renderModeSelect.addEventListener("change", () => {
    const selectedMode = renderModeSelect.value as RenderMode;
    if (selectedMode !== "approximation" && selectedMode !== "high-fidelity") {
      throw new Error(`Unsupported render mode: ${selectedMode}`);
    }
    controller.setRenderMode(selectedMode);
  });
}

if (captureButton) {
  captureButton.addEventListener("click", () => {
    const imageData = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.download = "image.png";
    anchor.href = imageData.replace("image/png", "image/octet-stream");
    anchor.click();
  });
}
