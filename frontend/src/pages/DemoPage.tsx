import {
  useEffect,
  useState,
} from "react";

import {
  useConversationControls,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";

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

const AGENT_ID =
  import.meta.env.VITE_ELEVENLABS_AGENT_ID;

export function DemoPage() {
  useEffect(() => {
    document.body.classList.add(
      "altur-demo-route",
    );

    return () => {
      document.body.classList.remove(
        "altur-demo-route",
      );
    };
  }, []);

  const [channel, setChannel] =
    useState<Channel | null>(null);

  const [voiceError, setVoiceError] =
    useState("");

  /*
   * ElevenLabs controls
   */
  const {
    startSession,
    endSession,
  } = useConversationControls();

  const {
    status,
  } = useConversationStatus();

  const {
    isSpeaking,
    isListening,
  } = useConversationMode();

  /*
   * Translate ElevenLabs state
   * into our visual orb states.
   */
  let agentState: AgentState = "idle";

  if (status === "connecting") {
    agentState = "connecting";
  } else if (
    status === "connected" &&
    isSpeaking
  ) {
    agentState = "speaking";
  } else if (
    status === "connected" &&
    isListening
  ) {
    agentState = "listening";
  } else if (status === "connected") {
    agentState = "thinking";
  }

  async function handleOrbClick() {
    try {
      setVoiceError("");

      /*
       * If already connected,
       * clicking the orb ends the session.
       */
      if (status === "connected") {
        await endSession();
        return;
      }

      if (status === "connecting") {
        return;
      }

      if (!AGENT_ID) {
        throw new Error(
          "Falta VITE_ELEVENLABS_AGENT_ID",
        );
      }

      /*
       * Browser microphone permission.
       */
      await navigator.mediaDevices
        .getUserMedia({
          audio: true,
        });

      /*
       * Start real ElevenLabs conversation.
       */
      await startSession({
        agentId: AGENT_ID,
      });
    } catch (error) {
      console.error(
        "Error iniciando Altur:",
        error,
      );

      setVoiceError(
        "No pudimos iniciar la conversación por voz.",
      );
    }
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
              ¿Qué necesitas
              <br />
              resolver hoy?
            </h1>

            <p>
              Habla con Altur o elige cómo
              quieres continuar tu atención.
            </p>
          </section>

          <section className="orb-card">
            <VoiceOrb
              state={agentState}
              onClick={handleOrbClick}
            />

            <OrbStatus
              state={agentState}
            />

            <span className="orb-caption">
              {status === "disconnected" &&
                "Toca la esfera para hablar con Altur"}

              {status === "connecting" &&
                "Conectando con Altur..."}

              {status === "connected" &&
                isSpeaking &&
                "Altur está hablando"}

              {status === "connected" &&
                isListening &&
                "Altur te escucha"}

              {status === "connected" &&
                !isSpeaking &&
                !isListening &&
                "Procesando tu solicitud"}
            </span>

            {voiceError && (
              <p className="voice-error">
                {voiceError}
              </p>
            )}

            {status === "connected" && (
              <button
                type="button"
                className="end-voice-session"
                onClick={() =>
                  endSession()
                }
              >
                Terminar conversación
              </button>
            )}
          </section>
        </main>

        <section className="channels-section">
          <ChannelGrid
            onSelect={setChannel}
          />
        </section>

        <WhatsAppModal
          open={
            channel === "whatsapp"
          }
          onClose={() =>
            setChannel(null)
          }
        />

        <SmsModal
          open={channel === "sms"}
          onClose={() =>
            setChannel(null)
          }
        />

        <CallModal
          open={channel === "call"}
          onClose={() =>
            setChannel(null)
          }
        />
      </DemoShell>
    </div>
  );
}