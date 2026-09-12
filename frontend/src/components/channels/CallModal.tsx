import {
  Mic,
  PhoneOff,
} from "lucide-react";

import { Modal } from "../ui/Modal";
import { VoiceOrb } from "../orb/VoiceOrb";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CallModal({
  open,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <div className="call-demo">
        <span className="call-demo__eyebrow">
          Llamada segura
        </span>

        <h2>Altur Assistant</h2>

        <span className="call-demo__timer">
          00:24
        </span>

        <VoiceOrb
          state="speaking"
          compact
        />

        <div className="call-demo__status">
          Respondiendo
        </div>

        <div className="call-transcript">
          “Vamos a revisar primero la transacción
          que no reconoces.”
        </div>

        <div className="call-actions">
          <button
            type="button"
            className="call-action"
          >
            <Mic size={19} />
          </button>

          <button
            type="button"
            className="call-action call-action--hangup"
            onClick={onClose}
          >
            <PhoneOff size={19} />
          </button>
        </div>
      </div>
    </Modal>
  );
}