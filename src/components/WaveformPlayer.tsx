import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { type Region } from 'wavesurfer.js/dist/plugins/regions.js';
import type { Ticket, TicketStatus } from '../types';
import { STATUS_COLORS } from '../types';
import { formatTime } from '../utils/time';

export interface WaveformPlayerHandle {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

interface WaveformPlayerProps {
  url: string;
  tickets: Ticket[];
  onRegionCreated: (start: number, end: number) => void;
  onRegionClicked: (ticketId: string) => void;
}

export const WaveformPlayer = forwardRef<WaveformPlayerHandle, WaveformPlayerProps>(
  function WaveformPlayer({ url, tickets, onRegionCreated, onRegionClicked }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WaveSurfer | null>(null);
    const regionsRef = useRef<RegionsPlugin | null>(null);
    const isPlayingRef = useRef(false);
    const currentTimeRef = useRef(0);

    // Stable callback refs
    const onRegionCreatedRef = useRef(onRegionCreated);
    onRegionCreatedRef.current = onRegionCreated;
    const onRegionClickedRef = useRef(onRegionClicked);
    onRegionClickedRef.current = onRegionClicked;

    useImperativeHandle(ref, () => ({
      seekTo(time: number) {
        const ws = wsRef.current;
        if (ws) {
          const duration = ws.getDuration();
          if (duration > 0) {
            ws.seekTo(time / duration);
          }
        }
      },
      play() {
        wsRef.current?.play();
      },
      pause() {
        wsRef.current?.pause();
      },
    }));

    // Init WaveSurfer
    useEffect(() => {
      if (!containerRef.current) return;

      const regions = RegionsPlugin.create();
      regionsRef.current = regions;

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#00ff88',
        progressColor: '#00cc6a',
        cursorColor: '#ffffff',
        cursorWidth: 2,
        height: 120,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        plugins: [regions],
      });

      wsRef.current = ws;

      ws.load(url);

      // Enable drag-to-create regions
      regions.enableDragSelection({
        color: 'rgba(0, 255, 136, 0.2)',
      });

      regions.on('region-created', (region: Region) => {
        // Only trigger for user-created regions (no id set yet or temp id)
        if (!region.id.startsWith('ticket-')) {
          onRegionCreatedRef.current(region.start, region.end);
          // Remove the temporary region — it will be re-created from tickets
          region.remove();
        }
      });

      regions.on('region-clicked', (region: Region, e: MouseEvent) => {
        e.stopPropagation();
        if (region.id.startsWith('ticket-')) {
          const ticketId = region.id.replace('ticket-', '');
          onRegionClickedRef.current(ticketId);
        }
      });

      ws.on('timeupdate', (time) => {
        currentTimeRef.current = time;
      });

      ws.on('play', () => {
        isPlayingRef.current = true;
      });

      ws.on('pause', () => {
        isPlayingRef.current = false;
      });

      return () => {
        ws.destroy();
        wsRef.current = null;
        regionsRef.current = null;
      };
    }, [url]);

    // Sync regions with tickets
    useEffect(() => {
      const regions = regionsRef.current;
      if (!regions) return;

      // Clear existing ticket regions
      regions.getRegions().forEach((r) => {
        if (r.id.startsWith('ticket-')) {
          r.remove();
        }
      });

      // Add regions for each ticket
      tickets.forEach((ticket) => {
        regions.addRegion({
          id: `ticket-${ticket.id}`,
          start: ticket.start,
          end: ticket.end,
          color: STATUS_COLORS[ticket.status as TicketStatus],
          drag: false,
          resize: false,
        });
      });
    }, [tickets]);

    const handlePlayPause = useCallback(() => {
      wsRef.current?.playPause();
    }, []);

    return (
      <div className="player">
        <div className="player__waveform" ref={containerRef} />
        <div className="player__controls">
          <button className="player__btn" onClick={handlePlayPause}>
            Play / Pause
          </button>
          <span className="player__time">{formatTime(currentTimeRef.current)}</span>
        </div>
      </div>
    );
  }
);
