import type { ReactNode } from "react";
import { cx, skinClass, type SkinProps } from "./common";

export interface FractalMenuProps
  extends React.HTMLAttributes<HTMLElement>,
    SkinProps {
  heading?: ReactNode;
}

export function FractalMenu({
  children,
  className,
  heading,
  skin = "none",
  ...rest
}: FractalMenuProps): React.JSX.Element {
  return (
    <nav
      {...rest}
      className={cx("fx-menu", skinClass(skin), className)}
      data-skin={skin}
      data-slot="fractal-menu"
    >
      {heading ? (
        <header className="fx-menu__title" data-slot="fractal-menu-title">
          {heading}
        </header>
      ) : null}
      <div className="fx-menu__body" data-slot="fractal-menu-body">
        {children}
      </div>
    </nav>
  );
}
