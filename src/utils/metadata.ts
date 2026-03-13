import * as musicMetadata from 'music-metadata-browser';
import { ID3Writer } from 'browser-id3-writer';
import type { TrackMeta } from '../types';

const KANBAN_TAG = 'AUDIO_KANBAN';

export async function parseAudioMetadata(
  file: File
): Promise<{ tickets: TrackMeta['tickets'] }> {
  console.log('[parseAudioMetadata] CALLED with file:', file.name, 'size:', file.size, 'type:', file.type);
  try {
    const metadata = await musicMetadata.parseBlob(file);
    const native = metadata.native;

    console.log('[parseAudioMetadata] formats:', Object.keys(native));
    // Search in ID3v2 tags
    for (const format of Object.keys(native)) {
      console.log(`[parseAudioMetadata] format="${format}", tags:`, native[format].map(t => ({ id: t.id, type: typeof t.value, value: typeof t.value === 'string' ? t.value.slice(0, 100) : t.value })));
      for (const tag of native[format]) {
        if (
          tag.id === 'TXXX:AUDIO_KANBAN' ||
          (tag.id === 'TXXX' &&
            typeof tag.value === 'object' &&
            tag.value !== null &&
            'description' in tag.value &&
            (tag.value as { description: string }).description === KANBAN_TAG)
        ) {
          const raw =
            typeof tag.value === 'string'
              ? tag.value
              : (tag.value as { text: string }).text;
          const parsed: TrackMeta = JSON.parse(raw);
          if (parsed.version === '1.0' && Array.isArray(parsed.tickets)) {
            return { tickets: parsed.tickets };
          }
        }
      }
    }
  } catch (err) {
    console.error('[parseAudioMetadata] ERROR:', err);
  }
  console.log('[parseAudioMetadata] no tickets found, returning empty');
  return { tickets: [] };
}

export async function exportMp3WithMetadata(
  file: File,
  meta: TrackMeta
): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  console.log('[exportMp3] original buffer size:', buffer.byteLength);
  const writer = new ID3Writer(buffer);
  const json = JSON.stringify(meta);
  console.log('[exportMp3] writing TXXX:AUDIO_KANBAN, json length:', json.length, 'preview:', json.slice(0, 200));
  writer.setFrame('TXXX', {
    description: KANBAN_TAG,
    value: json,
  });
  writer.addTag();
  const blob = writer.getBlob();
  console.log('[exportMp3] exported blob size:', blob.size);
  return blob;
}

export function exportWavWithMetadata(
  originalBuffer: ArrayBuffer,
  meta: TrackMeta
): Blob {
  const json = JSON.stringify(meta);
  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(json);

  // Pad to even length
  const padded =
    jsonBytes.length % 2 === 0
      ? jsonBytes
      : new Uint8Array([...jsonBytes, 0]);

  // Build a LIST/INFO chunk with a custom IKAN subchunk
  // LIST chunk: 'LIST' + size(4) + 'INFO' + subchunk
  // subchunk: 'IKAN' + size(4) + data
  const subChunkSize = 4 + 4 + padded.length; // 'IKAN' + size + data
  const listDataSize = 4 + subChunkSize; // 'INFO' + subchunk
  const listChunkTotalSize = 8 + listDataSize; // 'LIST' + size + data

  const src = new Uint8Array(originalBuffer);

  // Strip any existing LIST/INFO chunk that contains IKAN
  const cleaned = stripExistingKanbanChunk(src);

  // New file: cleaned RIFF + our LIST chunk
  const newSize = cleaned.length + listChunkTotalSize;
  const out = new Uint8Array(newSize);
  out.set(cleaned, 0);

  // Update RIFF size (bytes 4-7)
  const view = new DataView(out.buffer);
  view.setUint32(4, newSize - 8, true);

  // Write LIST chunk at the end
  let offset = cleaned.length;
  // 'LIST'
  out[offset++] = 0x4c;
  out[offset++] = 0x49;
  out[offset++] = 0x53;
  out[offset++] = 0x54;
  // LIST data size
  view.setUint32(offset, listDataSize, true);
  offset += 4;
  // 'INFO'
  out[offset++] = 0x49;
  out[offset++] = 0x4e;
  out[offset++] = 0x46;
  out[offset++] = 0x4f;
  // 'IKAN'
  out[offset++] = 0x49;
  out[offset++] = 0x4b;
  out[offset++] = 0x41;
  out[offset++] = 0x4e;
  // subchunk data size
  view.setUint32(offset, padded.length, true);
  offset += 4;
  // JSON data
  out.set(padded, offset);

  return new Blob([out], { type: 'audio/wav' });
}

function stripExistingKanbanChunk(src: Uint8Array): Uint8Array {
  // Simple approach: find LIST chunks, check if they contain IKAN, remove them
  const decoder = new TextDecoder();
  const parts: Uint8Array[] = [];
  let offset = 0;

  // Copy RIFF header (first 12 bytes)
  if (src.length < 12) return src;
  parts.push(src.slice(0, 12));
  offset = 12;

  while (offset + 8 <= src.length) {
    const chunkId = decoder.decode(src.slice(offset, offset + 4));
    const view = new DataView(src.buffer, src.byteOffset + offset + 4, 4);
    const chunkSize = view.getUint32(0, true);
    const totalChunkSize = 8 + chunkSize + (chunkSize % 2); // pad to even

    if (
      chunkId === 'LIST' &&
      offset + 12 <= src.length &&
      decoder.decode(src.slice(offset + 8, offset + 12)) === 'INFO'
    ) {
      // Check if this LIST/INFO contains IKAN
      const chunkData = decoder.decode(
        src.slice(offset + 12, offset + 8 + chunkSize)
      );
      if (chunkData.includes('IKAN')) {
        // Skip this chunk
        offset += totalChunkSize;
        continue;
      }
    }

    parts.push(src.slice(offset, offset + totalChunkSize));
    offset += totalChunkSize;
  }

  // Concatenate
  const totalLen = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const p of parts) {
    result.set(p, pos);
    pos += p.length;
  }
  return result;
}
