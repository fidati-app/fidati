interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClassName?: string;
  requireText?: string;
  textValue?: string;
  onTextChange?: (value: string) => void;
  textPlaceholder?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Conferma',
  confirmClassName = 'btn-primary',
  requireText,
  textValue = '',
  onTextChange,
  textPlaceholder,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const disabled = loading || (requireText ? textValue.trim().length < 3 : false);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        {requireText ? (
          <textarea
            value={textValue}
            onChange={(e) => onTextChange?.(e.target.value)}
            placeholder={textPlaceholder}
          />
        ) : null}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Annulla
          </button>
          <button type="button" className={`btn ${confirmClassName}`} onClick={onConfirm} disabled={disabled}>
            {loading ? 'Elaborazione…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
