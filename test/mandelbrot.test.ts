import { describe, expect, it } from "vitest";
import { createMandelbrot } from "../src/core/fractals/mandelbrot";

describe("createMandelbrot", () => {
  it("creates a standard default configuration", () => {
    const fractal = createMandelbrot();
    expect(fractal.region.center.x).toBe(-0.75);
    expect(fractal.maxiter).toBe(512);
    expect(fractal.bailout).toBe(4);
  });

  it("formula returns a color from the palette", () => {
    const fractal = createMandelbrot();
    const color = fractal.formula(0, 0);
    expect(fractal.palette.includes(color)).toBe(true);
  });
});
