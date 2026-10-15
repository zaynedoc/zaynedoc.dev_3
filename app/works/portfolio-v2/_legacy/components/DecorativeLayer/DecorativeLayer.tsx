import type { ReactNode } from "react";

type DecorativeLayerProps = {
  children: ReactNode;
  className: string;
};

export function DecorativeLayer({ children, className }: DecorativeLayerProps) {
  return (
    <div className={className} aria-hidden="true">
      {children}
    </div>
  );
}
