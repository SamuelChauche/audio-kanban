# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (`tsc -b && vite build`)
- `npm run lint` — ESLint across all TS/TSX files
- `npm run preview` — Preview production build locally

No test framework is configured.

## Architecture

Local-first React + TypeScript app for annotating audio tracks (MP3/WAV) with time-ranged tickets organized in a Kanban board. 100% client-side, no backend.

### Data Flow

1. User imports an audio file via drag & drop or file picker (`ImportZone`)
2. `useAudioFile` hook parses metadata with `music-metadata-browser` — if an `TXXX:AUDIO_KANBAN` ID3 tag (MP3) or `LIST/INFO/IKAN` WAV chunk exists, tickets are loaded
3. `WaveformPlayer` renders the waveform via `wavesurfer.js` v7 with RegionsPlugin — drag-creating a region opens `TicketModal` for new ticket, clicking existing region opens it for editing
4. `useTickets` hook manages ticket state via `useReducer` (SET/ADD/UPDATE/DELETE/MOVE actions)
5. `KanbanBoard` displays tickets in 4 columns (backlog/todo/in_progress/done); clicking a card seeks the player to that time range
6. `useExport` hook serializes tickets as `TrackMeta` JSON, writes it into the audio file metadata (`browser-id3-writer` for MP3, custom WAV chunk writer), and triggers download

### Key Files

- `src/types/index.ts` — Core types (`Ticket`, `TrackMeta`, `TicketStatus`, `TicketPriority`) and status/priority color maps
- `src/utils/metadata.ts` — Audio metadata read/write: `parseAudioMetadata`, `exportMp3WithMetadata`, `exportWavWithMetadata` with custom WAV RIFF chunk handling
- `src/App.tsx` — Root component orchestrating modal state and wiring hooks to components

### Conventions

- **Styling**: CSS custom properties + BEM naming — no Tailwind. Dark theme (`#0d0d0d` background, `#00ff88` accent)
- **Fonts**: `JetBrains Mono` for timestamps, `Syne` for titles (loaded from Google Fonts)
- **State**: `useState`/`useReducer` only — no external state management library
- **Metadata tag**: Kanban data is stored in ID3 `TXXX:AUDIO_KANBAN` (MP3) or WAV `LIST/INFO/IKAN` custom chunk as JSON with `{ version: "1.0", tickets: [...] }` schema
