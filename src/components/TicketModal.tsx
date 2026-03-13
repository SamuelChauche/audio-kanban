import { useState, useEffect } from 'react';
import type { Ticket, TicketStatus, TicketPriority } from '../types';
import { formatTime } from '../utils/time';

interface TicketModalProps {
  ticket: Partial<Ticket> & { start: number; end: number };
  isEdit: boolean;
  onSave: (data: {
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignee: string;
    start: number;
    end: number;
  }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function TicketModal({
  ticket,
  isEdit,
  onSave,
  onDelete,
  onCancel,
}: TicketModalProps) {
  const [title, setTitle] = useState(ticket.title || '');
  const [description, setDescription] = useState(ticket.description || '');
  const [status, setStatus] = useState<TicketStatus>(ticket.status || 'backlog');
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority || 'medium');
  const [assignee, setAssignee] = useState(ticket.assignee || '');

  useEffect(() => {
    setTitle(ticket.title || '');
    setDescription(ticket.description || '');
    setStatus(ticket.status || 'backlog');
    setPriority(ticket.priority || 'medium');
    setAssignee(ticket.assignee || '');
  }, [ticket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description,
      status,
      priority,
      assignee,
      start: ticket.start,
      end: ticket.end,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">
          {isEdit ? 'Edit Ticket' : 'New Ticket'}
        </h2>
        <p className="modal__range">
          {formatTime(ticket.start)} → {formatTime(ticket.end)}
        </p>
        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__label">
            Title *
            <input
              className="modal__input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="modal__label">
            Description
            <textarea
              className="modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <div className="modal__row">
            <label className="modal__label">
              Status
              <select
                className="modal__select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className="modal__label">
              Priority
              <select
                className="modal__select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <label className="modal__label">
            Assignee
            <input
              className="modal__input"
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </label>

          {isEdit && ticket.createdAt && (
            <p className="modal__meta">
              Created: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          )}

          <div className="modal__actions">
            {isEdit && onDelete && (
              <button
                type="button"
                className="modal__btn modal__btn--delete"
                onClick={onDelete}
              >
                Delete
              </button>
            )}
            <div className="modal__actions-right">
              <button
                type="button"
                className="modal__btn modal__btn--cancel"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button type="submit" className="modal__btn modal__btn--save">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
