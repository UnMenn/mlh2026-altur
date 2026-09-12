import { MessageCircleMore } from "lucide-react";
import { Modal } from "../ui/Modal";
import { WhatsAppQR } from "./WhatsAppQR";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WhatsAppModal({
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
          <MessageCircleMore size={18} />
          WhatsApp
        </div>

        <h2>Continúa desde tu teléfono</h2>

        <p>
          Escanea el código para abrir la conversación
          con el asistente de Altur.
        </p>

        <div className="qr-demo">
          <WhatsAppQR
            phoneNumber="528131023582"
          />
        </div>

        <div className="connection-status">
          <span />
          Esperando conexión
        </div>

        <button
          type="button"
          className="primary-button"
        >
          Abrir WhatsApp
        </button>
      </div>
    </Modal>
  );
}