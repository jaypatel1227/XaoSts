import { cx, skinClass, type SkinProps } from "./common";

export interface FractalPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    SkinProps {}

export function FractalPanel({
  children,
  className,
  skin = "none",
  ...rest
}: FractalPanelProps): React.JSX.Element {
  return (
    <section
      {...rest}
      className={cx("fx-panel", skinClass(skin), className)}
      data-skin={skin}
      data-slot="fractal-panel"
    >
      {children}
    </section>
  );
}
