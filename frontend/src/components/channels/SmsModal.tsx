import {
  MessageSquareText,
  Send,
} from "lucide-react";

import { Modal } from "../ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SmsModal({
  open,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <div className="channel-modal">
        <div className="channel-modal__badge">
          <MessageSquareText size={18} />
          SMS
        </div>

        <h2>Mensajería segura</h2>

        <p>
          Recibe confirmaciones y continúa el proceso
          sin perder el contexto.
        </p>

        <div className="phone-message-demo">
          <div className="phone-message-demo__header">
            Altur
            <small>Asistente verificado</small>
          </div>

          <div className="chat">
            <div className="message message--assistant">
              Detectamos que estás revisando un cargo
              que no reconoces.
            </div>

            <div className="message message--user">
              Sí, quiero revisarlo.
            </div>

            <div className="message message--assistant">
              Perfecto. Te enviaré una verificación
              antes de continuar.
            </div>
          </div>

          <div className="message-input">
            <span>Mensaje</span>

            <button type="button">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}