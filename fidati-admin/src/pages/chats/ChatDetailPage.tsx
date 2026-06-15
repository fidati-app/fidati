import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchConversationMessages } from '@/services/chatService';
import { formatDate } from '@/utils/format';

export function ChatDetailPage() {
  const { id = '' } = useParams();
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof fetchConversationMessages>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchConversationMessages(id).then(setMessages).finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <div className="page-header">
        <Link to="/chats" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Chat</Link>
        <h2>Conversazione</h2>
      </div>
      <div className="card review-panel">
        {loading ? (
          <div className="empty-state">Caricamento messaggi…</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">Nessun messaggio in questa conversazione</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {messages.map((m) => (
              <div key={m.id} className="chat-bubble">
                <div className="chat-meta">
                  <span className="badge badge-neutral">{m.sender}</span>
                  <span>{formatDate(m.created_at)}</span>
                </div>
                <p style={{ margin: '6px 0 0' }}>{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
