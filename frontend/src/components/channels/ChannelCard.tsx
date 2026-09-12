import type { LucideIcon } from "lucide-react";
import type { Channel } from "../../types";

type ChannelCardProps = {
  channel: Channel;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: (channel: Channel) => void;
};

export function ChannelCard({
  channel,
  title,
  description,
  icon: Icon,
  onClick,
}: ChannelCardProps) {
  return (
    <button
      type="button"
      className="channel-card"
      onClick={() => onClick(channel)}
    >
      <div className="channel-card__icon">
        <Icon size={23} strokeWidth={1.8} />
      </div>

      <div className="channel-card__body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <span className="channel-card__arrow">
        ↗
      </span>
    </button>
  );
}