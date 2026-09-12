import type { AgentState } from "../../types";

type VoiceOrbProps = {
  state: AgentState;
  compact?: boolean;
  onClick?: () => void;
};

export function VoiceOrb({
  state,
  compact = false,
  onClick,
}: VoiceOrbProps) {
  return (
    <button
      type="button"
      className={[
        "voice-orb",
        `voice-orb--${state}`,
        compact ? "voice-orb--compact" : "",
      ].join(" ")}
      onClick={onClick}
      aria-label="Voice assistant"
    >
      <span className="voice-orb__blob voice-orb__blob--one" />
      <span className="voice-orb__blob voice-orb__blob--two" />
      <span className="voice-orb__blob voice-orb__blob--three" />
      <span className="voice-orb__shine" />
    </button>
  );
}