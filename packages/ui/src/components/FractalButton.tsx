import { cx, skinClass, type SkinProps } from "./common";

export interface FractalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    SkinProps {}

export function FractalButton({
  children,
  className,
  skin = "none",
  type = "button",
  ...rest
}: FractalButtonProps): React.JSX.Element {
  return (
    <button
      {...rest}
      type={type}
      className={cx("fx-button", skinClass(skin), className)}
      data-skin={skin}
      data-slot="fractal-button"
    >
      {children}
    </button>
  );
}
