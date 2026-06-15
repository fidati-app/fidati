import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { session, isAdmin, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && session && isAdmin) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    if (result.error) setError(result.error);
    setSubmitting(false);
  };

  return (
    <div className="login-screen">
      <div className="card login-card">
        <h1>Fidati Admin</h1>
        <p>Accesso riservato al team interno. Usa le credenziali Supabase Auth autorizzate.</p>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <div className="form-error">{error}</div> : null}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Accesso…' : 'Accedi al pannello'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AccessDeniedPage() {
  const { session, signOut } = useAuth();

  return (
    <div className="access-denied">
      <div className="card" style={{ padding: 28, maxWidth: 480 }}>
        <h2>Accesso negato</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {session
            ? 'Il tuo account non è autorizzato come admin Fidati. Contatta un super admin.'
            : 'Effettua il login con un account staff autorizzato.'}
        </p>
        {session ? (
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            Esci
          </button>
        ) : null}
      </div>
    </div>
  );
}
