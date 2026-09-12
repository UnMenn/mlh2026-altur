import type { AgentState } from "../../types";

const labels: Record<AgentState, string> = {
  idle: "Listo para ayudarte",
  listening: "Escuchando",
  thinking: "Procesando",
  speaking: "Respondiendo",
  connecting: "Conectando",
};

export function OrbStatus({
  state,
}: {
  state: AgentState;
}) {
  return (
    <div className="orb-status">
      <span
        className={`orb-status__dot orb-status__dot--${state}`}
      />
      {labels[state]}
    </div>
  );
}