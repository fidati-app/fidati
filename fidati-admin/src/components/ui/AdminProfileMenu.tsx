import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Shield, User } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ALL_PERMISSIONS } from '@/constants/permissions';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  review_team: 'Team revisione',
  accounting_team: 'Team contabile',
  support_team: 'Team supporto',
  operator: 'Operatore',
};

function initials(name: string, email: string) {
  const src = name.trim() || email;
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function AdminProfileMenu() {
  const { admin, signOut } = useAuth();
  const { can, customPermissions } = usePermissions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!admin) return null;

  const perms = customPermissions.length > 0
    ? customPermissions
    : ALL_PERMISSIONS.filter((p) => can(p.key)).map((p) => p.key);

  return (
    <div className="admin-profile-menu" ref={ref}>
      <button type="button" className="admin-profile-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="admin-avatar">{initials(admin.fullName, admin.email)}</span>
        <span className="admin-profile-text">
          <span className="admin-profile-name">{admin.fullName || admin.email}</span>
          <span className="badge badge-purple">{ROLE_LABELS[admin.role] ?? admin.role}</span>
        </span>
        <ChevronDown size={16} />
      </button>

      {open ? (
        <div className="admin-profile-dropdown card">
          <div className="admin-profile-dropdown-header">
            <span className="admin-avatar admin-avatar-lg">{initials(admin.fullName, admin.email)}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{admin.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{admin.email}</div>
            </div>
          </div>
          <Link to="/staff" className="admin-dropdown-item" onClick={() => setOpen(false)}>
            <User size={16} /> Il mio profilo
          </Link>
          <div className="admin-dropdown-item admin-dropdown-perms">
            <Shield size={16} /> Permessi attivi
            <div className="admin-perm-tags">
              {perms.slice(0, 8).map((p) => (
                <span key={p} className="badge badge-neutral">{p.split('.')[0]}</span>
              ))}
              {perms.length > 8 ? <span className="badge badge-neutral">+{perms.length - 8}</span> : null}
            </div>
          </div>
          <button type="button" className="admin-dropdown-item danger" onClick={() => void signOut()}>
            <LogOut size={16} /> Esci
          </button>
        </div>
      ) : null}
    </div>
  );
}
