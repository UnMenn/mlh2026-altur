import type { ReactNode } from "react";

type IconButtonProps = {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
};

export function IconButton({
  children,
  label,
  onClick,
  danger = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button ${
        danger ? "icon-button--danger" : ""
      }`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}