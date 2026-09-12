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

        <main className="demo-content">
          <section className="demo-intro">
            <span className="demo-label">
              CENTRO DE ATENCIÓN AUTOMATIZADO
            </span>

            <h1>
              ¿Cómo quieres
              <br />
              continuar tu caso?
            </h1>

            <p>
              Un mismo asistente, una misma conversación,
              en cualquier canal.
            </p>
          </section>

          <section className="orb-card">
            <VoiceOrb
              state={agentState}
              onClick={cycleOrb}
            />

            <OrbStatus state={agentState} />

            <span className="orb-caption">
              Toca la esfera para probar sus estados
            </span>
          </section>
        </main>

        <section className="channels-section">
          <ChannelGrid onSelect={setChannel} />
        </section>

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