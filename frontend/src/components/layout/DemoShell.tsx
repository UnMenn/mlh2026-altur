import type { ReactNode } from "react";

type DemoShellProps = {
  children: ReactNode;
};

export function DemoShell({
  children,
}: DemoShellProps) {
  return (
    <div className="demo-shell">
      {children}
    </div>
  );
}