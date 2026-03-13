import { useCallback } from 'react';
import { exportMp3WithMetadata, exportWavWithMetadata } from '../utils/metadata';
import type { Ticket, TrackMeta } from '../types';

export function useExport() {
  const exportFile = useCallback(async (file: File, tickets: Ticket[]) => {
    const meta: TrackMeta = { version: '1.0', tickets };

    let blob: Blob;
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'mp3') {
      blob = await exportMp3WithMetadata(file, meta);
    } else {
      const buffer = await file.arrayBuffer();
      blob = exportWavWithMetadata(buffer, meta);
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return { exportFile };
}
