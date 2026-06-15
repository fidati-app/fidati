interface ImageLightboxProps {
  open: boolean;
  src: string | null;
  title?: string;
  onClose: () => void;
}

export function ImageLightbox({ open, src, title, onClose }: ImageLightboxProps) {
  if (!open || !src) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose}>
          Chiudi ✕
        </button>
        {title ? <div className="lightbox-title">{title}</div> : null}
        <img src={src} alt={title ?? 'Anteprima'} className="lightbox-image" />
      </div>
    </div>
  );
}
