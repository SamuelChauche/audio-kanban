import { useState, useRef, useCallback, useEffect } from 'react';
import { ImportZone } from './components/ImportZone';
import { WaveformPlayer, type WaveformPlayerHandle } from './components/WaveformPlayer';
import { TicketModal } from './components/TicketModal';
import { KanbanBoard } from './components/KanbanBoard';
import { ExportButton } from './components/ExportButton';
import { useAudioFile } from './hooks/useAudioFile';
import { useTickets } from './hooks/useTickets';
import { useExport } from './hooks/useExport';
import type { Ticket, TicketStatus, TicketPriority } from './types';
import './App.css';

interface ModalState {
  open: boolean;
  isEdit: boolean;
  ticket: (Partial<Ticket> & { start: number; end: number }) | null;
}

function App() {
  const { file, objectUrl, tickets: initialTickets, loading, loadFile } = useAudioFile();
  const { tickets, setTickets, addTicket, updateTicket, deleteTicket, moveTicket } =
    useTickets();
  const { exportFile } = useExport();
  const playerRef = useRef<WaveformPlayerHandle>(null);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    isEdit: false,
    ticket: null,
  });

  useEffect(() => {
    if (initialTickets.length > 0) {
      setTickets(initialTickets);
    }
  }, [initialTickets, setTickets]);

  const handleRegionCreated = useCallback((start: number, end: number) => {
    setModal({
      open: true,
      isEdit: false,
      ticket: { start, end },
    });
  }, []);

  const handleRegionClicked = useCallback(
    (ticketId: string) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        setModal({ open: true, isEdit: true, ticket });
      }
    },
    [tickets]
  );

  const handleTicketClick = useCallback((ticket: Ticket) => {
    setModal({ open: true, isEdit: true, ticket });
  }, []);

  const handleSeek = useCallback((time: number) => {
    const player = playerRef.current;
    if (player) {
      player.seekTo(time);
      player.play();
    }
  }, []);

  const handleSave = useCallback(
    (data: {
      title: string;
      description: string;
      status: TicketStatus;
      priority: TicketPriority;
      assignee: string;
      start: number;
      end: number;
    }) => {
      if (modal.isEdit && modal.ticket?.id) {
        updateTicket({
          ...(modal.ticket as Ticket),
          ...data,
        });
      } else {
        addTicket(data);
      }
      setModal({ open: false, isEdit: false, ticket: null });
    },
    [modal, addTicket, updateTicket]
  );

  const handleDelete = useCallback(() => {
    if (modal.ticket?.id) {
      deleteTicket(modal.ticket.id);
    }
    setModal({ open: false, isEdit: false, ticket: null });
  }, [modal, deleteTicket]);

  const handleCancel = useCallback(() => {
    setModal({ open: false, isEdit: false, ticket: null });
  }, []);

  const handleExport = useCallback(() => {
    if (file) {
      exportFile(file, tickets);
    }
  }, [file, tickets, exportFile]);

  if (!objectUrl) {
    return (
      <div className="app app--import">
        <header className="app__header">
          <h1 className="app__title">Audio Kanban</h1>
        </header>
        <ImportZone onFileSelected={loadFile} />
        {loading && <p className="app__loading">Loading audio...</p>}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Audio Kanban</h1>
        <div className="app__header-actions">
          <span className="app__filename">{file?.name}</span>
          <ExportButton onExport={handleExport} disabled={!file} />
        </div>
      </header>

      <WaveformPlayer
        ref={playerRef}
        url={objectUrl}
        tickets={tickets}
        onRegionCreated={handleRegionCreated}
        onRegionClicked={handleRegionClicked}
      />

      <KanbanBoard
        tickets={tickets}
        onTicketClick={handleTicketClick}
        onSeek={handleSeek}
        onMoveTicket={moveTicket}
      />

      {modal.open && modal.ticket && (
        <TicketModal
          ticket={modal.ticket}
          isEdit={modal.isEdit}
          onSave={handleSave}
          onDelete={modal.isEdit ? handleDelete : undefined}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default App;
