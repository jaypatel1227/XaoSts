import { createDefaultPalette } from "../palette";
import type { FractalConfig } from "../types";

export function createMandelbrot(): FractalConfig {
  const palette = createDefaultPalette();

  const fractal: FractalConfig = {
    symmetry: { x: null, y: 0 },
    region: {
      center: { x: -0.75, y: 0.0 },
      radius: { x: 2.5, y: 2.5 },
      angle: 0
    },
    z0: { x: 0, y: 0 },
    maxiter: 512,
    bailout: 4,
    formula(cr: number, ci: number): number {
      const maxiter = this.maxiter;
      const bailout = this.bailout;
      let zr = this.z0.x;
      let zi = this.z0.y;
      let i = maxiter;

      while (i--) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;

        if (zr2 + zi2 > bailout) {
          const index = (maxiter - i) % this.palette.length;
          const color = this.palette[index];
          if (color === undefined) {
            throw new Error("Mandelbrot palette index out of range");
          }
          return color;
        }

        zi = ci + 2 * zr * zi;
        zr = cr + zr2 - zi2;
      }

      const originColor = this.palette[0];
      if (originColor === undefined) {
        throw new Error("Mandelbrot palette is empty");
      }
      return originColor;
    },
    palette
  };

  return fractal;
}
