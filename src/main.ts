import { createMandelbrot } from "./core/fractals/mandelbrot";
import { createLegacyZoomController } from "./runtime/legacyXaosAdapter";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
const captureButton = document.querySelector<HTMLButtonElement>("#captureButton");

if (!canvas) {
  throw new Error("Missing #canvas element");
}

const fractal = createMandelbrot();
const controller = createLegacyZoomController(canvas, fractal);
controller.start();

if (captureButton) {
  captureButton.addEventListener("click", () => {
    const imageData = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.download = "image.png";
    anchor.href = imageData.replace("image/png", "image/octet-stream");
    anchor.click();
  });
}
