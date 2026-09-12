type StatusDotProps = {
  active?: boolean;
};

export function StatusDot({
  active = true,
}: StatusDotProps) {
  return (
    <span
      className={`status-dot ${
        active ? "status-dot--active" : ""
      }`}
    />
  );
}