import { useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Ticket, TicketStatus, TicketPriority } from '../types';

type Action =
  | { type: 'SET'; tickets: Ticket[] }
  | { type: 'ADD'; ticket: Ticket }
  | { type: 'UPDATE'; ticket: Ticket }
  | { type: 'DELETE'; id: string }
  | { type: 'MOVE'; id: string; status: TicketStatus };

function reducer(state: Ticket[], action: Action): Ticket[] {
  switch (action.type) {
    case 'SET':
      return action.tickets;
    case 'ADD':
      return [...state, action.ticket];
    case 'UPDATE':
      return state.map((t) => (t.id === action.ticket.id ? action.ticket : t));
    case 'DELETE':
      return state.filter((t) => t.id !== action.id);
    case 'MOVE':
      return state.map((t) =>
        t.id === action.id
          ? { ...t, status: action.status, updatedAt: new Date().toISOString() }
          : t
      );
  }
}

export function useTickets(initial: Ticket[] = []) {
  const [tickets, dispatch] = useReducer(reducer, initial);

  const setTickets = useCallback((tickets: Ticket[]) => {
    dispatch({ type: 'SET', tickets });
  }, []);

  const addTicket = useCallback(
    (data: {
      start: number;
      end: number;
      title: string;
      description: string;
      status: TicketStatus;
      priority: TicketPriority;
      assignee?: string;
    }) => {
      const now = new Date().toISOString();
      const ticket: Ticket = {
        id: uuidv4(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD', ticket });
      return ticket;
    },
    []
  );

  const updateTicket = useCallback((ticket: Ticket) => {
    dispatch({
      type: 'UPDATE',
      ticket: { ...ticket, updatedAt: new Date().toISOString() },
    });
  }, []);

  const deleteTicket = useCallback((id: string) => {
    dispatch({ type: 'DELETE', id });
  }, []);

  const moveTicket = useCallback((id: string, status: TicketStatus) => {
    dispatch({ type: 'MOVE', id, status });
  }, []);

  return { tickets, setTickets, addTicket, updateTicket, deleteTicket, moveTicket };
}
