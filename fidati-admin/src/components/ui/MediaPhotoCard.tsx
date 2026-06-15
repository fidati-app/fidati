type Props = {
  src: string;
  title: string;
  subtitle?: string;
  onOpen: () => void;
  onRequestChange?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
  showDownload?: boolean;
  layout?: 'portfolio' | 'document' | 'work';
};

export function MediaPhotoCard({
  src,
  title,
  subtitle,
  onOpen,
  onRequestChange,
  onDelete,
  showDelete,
  showDownload,
  layout = 'portfolio',
}: Props) {
  const download = () => {
    const a = document.createElement('a');
    a.href = src;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    a.click();
  };

  return (
    <article className={`media-photo-card media-photo-card--${layout}`}>
      <button type="button" className="media-photo-card-image" onClick={onOpen} aria-label={`Apri ${title}`}>
        <img src={src} alt={title} loading="lazy" />
      </button>
      <div className="media-photo-card-body">
        <div className="media-photo-card-text">
          <div className="media-photo-card-title">{title}</div>
          {subtitle ? <div className="media-photo-card-sub">{subtitle}</div> : null}
        </div>
        <div className="media-photo-card-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onOpen}>Apri</button>
          {layout === 'document' ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onOpen}>Zoom</button>
              {showDownload !== false ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={download}>Scarica</button>
              ) : null}
            </>
          ) : null}
          {onRequestChange ? (
            <button type="button" className="btn btn-warning btn-sm" onClick={onRequestChange}>Richiedi modifica</button>
          ) : null}
          {showDelete && onDelete ? (
            <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>Elimina</button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
