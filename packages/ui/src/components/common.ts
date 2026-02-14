import type { FractalSkinName } from "../types";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(" ");
}

export interface SkinProps {
  skin?: FractalSkinName;
}

export function skinClass(skin: FractalSkinName | undefined): string {
  if (!skin || skin === "none") {
    return "";
  }

  return `fx-skin-${skin}`;
}
