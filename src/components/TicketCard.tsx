import type { Ticket } from '../types';
import { PRIORITY_COLORS } from '../types';
import { formatTime } from '../utils/time';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  onSeek: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function TicketCard({
  ticket,
  onClick,
  onSeek,
  draggable,
  onDragStart,
}: TicketCardProps) {
  return (
    <div
      className="ticket-card"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="ticket-card__header">
        <span className="ticket-card__title">{ticket.title}</span>
        <span
          className="ticket-card__priority"
          style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] }}
        >
          {ticket.priority}
        </span>
      </div>
      <button
        className="ticket-card__time"
        onClick={(e) => {
          e.stopPropagation();
          onSeek();
        }}
        title="Seek to this position"
      >
        {formatTime(ticket.start)} → {formatTime(ticket.end)}
      </button>
      {ticket.assignee && (
        <span className="ticket-card__assignee">{ticket.assignee}</span>
      )}
    </div>
  );
}
