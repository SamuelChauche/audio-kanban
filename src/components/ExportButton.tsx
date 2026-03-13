interface ExportButtonProps {
  onExport: () => void;
  disabled: boolean;
}

export function ExportButton({ onExport, disabled }: ExportButtonProps) {
  return (
    <button
      className="export-btn"
      onClick={onExport}
      disabled={disabled}
    >
      Export
    </button>
  );
}
