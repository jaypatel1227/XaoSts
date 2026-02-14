import type { CSSProperties, ReactNode } from "react";
import { cx } from "../components/common";
import {
  resolveThemeTokens,
  toThemeStyleMap,
  type FractalThemeTokens,
  type FractalThemeTone
} from "./tokens";

export interface FractalThemeProviderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  children: ReactNode;
  tone?: FractalThemeTone;
  tokens?: Partial<FractalThemeTokens>;
  style?: CSSProperties;
}

export function FractalThemeProvider({
  children,
  className,
  tone = "neutral",
  tokens,
  style,
  ...rest
}: FractalThemeProviderProps): React.JSX.Element {
  const themeTokens = resolveThemeTokens(tone, tokens);
  const themeStyle: CSSProperties = {
    ...toThemeStyleMap(themeTokens),
    ...style
  };

  return (
    <div
      {...rest}
      className={cx("fx-theme", `fx-tone-${tone}`, className)}
      style={themeStyle}
      data-slot="fractal-theme"
    >
      {children}
    </div>
  );
}
