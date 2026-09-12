import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { DemoShell } from "../components/layout/DemoShell";

import { VoiceOrb } from "../components/orb/VoiceOrb";
import { OrbStatus } from "../components/orb/OrbStatus";

import { ChannelGrid } from "../components/channels/ChannelGrid";
import { WhatsAppModal } from "../components/channels/WhatsAppModal";
import { SmsModal } from "../components/channels/SmsModal";
import { CallModal } from "../components/channels/CallModal";

import type {
  AgentState,
  Channel,
} from "../types";

import "../styles/tokens.css";
import "../styles/demo.css";
import "../styles/animations.css";

export function DemoPage() {
  useEffect(() => {
    document.body.classList.add("altur-demo-route");

    return () => {
      document.body.classList.remove("altur-demo-route");
    };
  }, []);
  const [channel, setChannel] =
    useState<Channel | null>(null);

  const [agentState, setAgentState] =
    useState<AgentState>("idle");

  function cycleOrb() {
    const sequence: AgentState[] = [
      "idle",
      "listening",
      "thinking",
      "speaking",
    ];

    const current =
      sequence.indexOf(agentState);

    setAgentState(
      sequence[
        (current + 1) % sequence.length
      ],
    );
  }

  return (
    <div className="demo-page">
      <DemoShell>
        <Header />

        <main className="hero">
          <div className="hero__eyebrow">
            Centro de atención automatizado
          </div>

          <VoiceOrb
            state={agentState}
            onClick={cycleOrb}
          />

          <OrbStatus state={agentState} />

          <h1>
            ¿Cómo quieres
            <br />
            continuar?
          </h1>

          <p className="hero__description">
            Un mismo asistente, una misma conversación,
            en cualquier canal.
          </p>

          <ChannelGrid
            onSelect={setChannel}
          />

          <p className="hero__hint">
            Toca la esfera para probar sus estados.
          </p>
        </main>

        <WhatsAppModal
          open={channel === "whatsapp"}
          onClose={() => setChannel(null)}
        />

        <SmsModal
          open={channel === "sms"}
          onClose={() => setChannel(null)}
        />

        <CallModal
          open={channel === "call"}
          onClose={() => setChannel(null)}
        />
      </DemoShell>
    </div>
  );
}