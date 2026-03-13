import { useCallback, useRef, useState } from 'react';

interface ImportZoneProps {
  onFileSelected: (file: File) => void;
}

export function ImportZone({ onFileSelected }: ImportZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'mp3' || ext === 'wav') {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`import-zone ${dragOver ? 'import-zone--active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav"
        onChange={handleInputChange}
        className="import-zone__input"
      />
      <div className="import-zone__content">
        <div className="import-zone__icon">♫</div>
        <p className="import-zone__text">
          Drop an audio file here or <span className="import-zone__link">browse</span>
        </p>
        <p className="import-zone__hint">MP3 or WAV</p>
      </div>
    </div>
  );
}
