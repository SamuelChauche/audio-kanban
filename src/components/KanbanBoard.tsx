import { useCallback } from 'react';
import type { Ticket, TicketStatus } from '../types';
import { KANBAN_COLUMNS, STATUS_LABELS } from '../types';
import { TicketCard } from './TicketCard';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onSeek: (time: number) => void;
  onMoveTicket: (id: string, status: TicketStatus) => void;
}

export function KanbanBoard({
  tickets,
  onTicketClick,
  onSeek,
  onMoveTicket,
}: KanbanBoardProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (status: TicketStatus) => (e: React.DragEvent) => {
      e.preventDefault();
      const ticketId = e.dataTransfer.getData('text/plain');
      if (ticketId) {
        onMoveTicket(ticketId, status);
      }
    },
    [onMoveTicket]
  );

  const handleDragStart = useCallback(
    (ticketId: string) => (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', ticketId);
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  return (
    <div className="kanban">
      {KANBAN_COLUMNS.map((status) => {
        const columnTickets = tickets.filter((t) => t.status === status);
        return (
          <div
            key={status}
            className={`kanban__column kanban__column--${status}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop(status)}
          >
            <div className="kanban__header">
              <span className="kanban__header-label">{STATUS_LABELS[status]}</span>
              <span className="kanban__header-count">{columnTickets.length}</span>
            </div>
            <div className="kanban__cards">
              {columnTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => onTicketClick(ticket)}
                  onSeek={() => {
                    onSeek(ticket.start);
                  }}
                  draggable
                  onDragStart={handleDragStart(ticket.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
