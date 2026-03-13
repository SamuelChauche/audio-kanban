import { useState, useCallback } from 'react';
import { parseAudioMetadata } from '../utils/metadata';
import type { Ticket } from '../types';

interface AudioFileState {
  file: File | null;
  objectUrl: string | null;
  tickets: Ticket[];
  loading: boolean;
}

export function useAudioFile() {
  const [state, setState] = useState<AudioFileState>({
    file: null,
    objectUrl: null,
    tickets: [],
    loading: false,
  });

  const loadFile = useCallback(async (file: File) => {
    setState((prev) => {
      if (prev.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return { file: null, objectUrl: null, tickets: [], loading: true };
    });

    const { tickets } = await parseAudioMetadata(file);
    const objectUrl = URL.createObjectURL(file);

    setState({ file, objectUrl, tickets, loading: false });
  }, []);

  return { ...state, loadFile };
}
