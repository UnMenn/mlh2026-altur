import {
  MessageCircleMore,
  MessageSquareText,
  Phone,
} from "lucide-react";

import { ChannelCard } from "./ChannelCard";
import type { Channel } from "../../types";

type Props = {
  onSelect: (channel: Channel) => void;
};

export function ChannelGrid({
  onSelect,
}: Props) {
  return (
    <div className="channel-grid">
      <ChannelCard
        channel="whatsapp"
        title="WhatsApp"
        description="Continúa la conversación desde tu teléfono."
        icon={MessageCircleMore}
        onClick={onSelect}
      />

      <ChannelCard
        channel="sms"
        title="SMS"
        description="Recibe confirmaciones y verificaciones rápidas."
        icon={MessageSquareText}
        onClick={onSelect}
      />

      <ChannelCard
        channel="call"
        title="Llamada"
        description="Habla directamente con el asistente."
        icon={Phone}
        onClick={onSelect}
      />
    </div>
  );
}