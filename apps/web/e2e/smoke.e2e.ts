import { expect, test } from "@playwright/test";

test("app boots and renders fractal canvas", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "XaoS TypeScript" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Capture" })).toBeVisible();

  const canvas = page.locator("#canvas");
  await expect(canvas).toBeVisible();

  const dimensions = await canvas.evaluate((node) => {
    const element = node as HTMLCanvasElement;
    return {
      width: element.width,
      height: element.height,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight
    };
  });

  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.height).toBeGreaterThan(0);
  expect(dimensions.width).toBe(dimensions.clientWidth);
  expect(dimensions.height).toBe(dimensions.clientHeight);
});

test("zoom interaction updates pixels", async ({ page }) => {
  await page.goto("/");

  const canvas = page.locator("#canvas");
  await expect(canvas).toBeVisible();

  const snapshot = async (): Promise<number> =>
    canvas.evaluate((node) => {
      const element = node as HTMLCanvasElement;
      const ctx = element.getContext("2d");
      if (!ctx) {
        throw new Error("Missing 2D context");
      }

      // Build a tiny deterministic signature from points across the image.
      const cols = 6;
      const rows = 4;
      let signature = 0;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const px = Math.floor(((x + 1) * element.width) / (cols + 1));
          const py = Math.floor(((y + 1) * element.height) / (rows + 1));
          const rgba = ctx.getImageData(px, py, 1, 1).data;
          signature +=
            rgba[0]! * 3 +
            rgba[1]! * 5 +
            rgba[2]! * 7 +
            rgba[3]! * 11 +
            px +
            py;
        }
      }

      return signature;
    });

  const before = await snapshot();
  await canvas.hover();
  await page.mouse.down({ button: "left" });
  await page.waitForTimeout(800);
  await page.mouse.up({ button: "left" });
  await page.waitForTimeout(200);
  const after = await snapshot();

  expect(after).not.toBe(before);
});
