export type TicketStatus = 'backlog' | 'todo' | 'in_progress' | 'done';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  start: number;
  end: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackMeta {
  version: '1.0';
  tickets: Ticket[];
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  backlog: 'rgba(128, 128, 128, 0.3)',
  todo: 'rgba(66, 133, 244, 0.3)',
  in_progress: 'rgba(255, 152, 0, 0.3)',
  done: 'rgba(0, 255, 136, 0.3)',
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
};

export const KANBAN_COLUMNS: TicketStatus[] = ['backlog', 'todo', 'in_progress', 'done'];
