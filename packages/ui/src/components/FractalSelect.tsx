import { cx, skinClass, type SkinProps } from "./common";

export interface FractalSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    SkinProps {}

export function FractalSelect({
  children,
  className,
  skin = "none",
  ...rest
}: FractalSelectProps): React.JSX.Element {
  return (
    <select
      {...rest}
      className={cx("fx-select", skinClass(skin), className)}
      data-skin={skin}
      data-slot="fractal-select"
    >
      {children}
    </select>
  );
}
