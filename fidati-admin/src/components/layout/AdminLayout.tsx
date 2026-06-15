import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserCircle,
  ClipboardList,
  Flag,
  Wallet,
  UserCog,
  ScrollText,
  Settings,
  LogOut,
  MessageSquare,
} from 'lucide-react';

import { GlobalSearch } from '@/components/search/GlobalSearch';
import { AdminProfileMenu } from '@/components/ui/AdminProfileMenu';
import { NAV_PERMISSIONS } from '@/constants/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, type Permission } from '@/hooks/usePermissions';

type NavItem =
  | { section: string }
  | { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean; permission: Permission };

const NAV: NavItem[] = [
  { section: 'Operazioni' },
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, permission: 'dashboard.view' },
  { to: '/professionals', label: 'Professionisti', icon: Users, permission: 'professionals.view' },
  { to: '/verifications', label: 'Verifiche', icon: ShieldCheck, permission: 'verifications.view' },
  { to: '/customers', label: 'Clienti', icon: UserCircle, permission: 'customers.view' },
  { to: '/requests', label: 'Richieste', icon: ClipboardList, permission: 'requests.view' },
  { to: '/chats', label: 'Chat', icon: MessageSquare, permission: 'chats.view' },
  { to: '/reports', label: 'Segnalazioni', icon: Flag, permission: 'reports.view' },
  { section: 'Amministrazione' },
  { to: '/accounting', label: 'Contabilità', icon: Wallet, permission: 'accounting.view' },
  { to: '/staff', label: 'Staff Fidati', icon: UserCog, permission: 'staff.view' },
  { to: '/audit', label: 'Log e sicurezza', icon: ScrollText, permission: 'audit.view' },
  { to: '/settings', label: 'Impostazioni', icon: Settings, permission: 'settings.view' },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const { can } = usePermissions();

  const visibleNav = NAV.filter((item) => {
    if ('section' in item) {
      const sectionIndex = NAV.indexOf(item);
      const nextItems = NAV.slice(sectionIndex + 1);
      const nextSectionIndex = nextItems.findIndex((i) => 'section' in i);
      const sectionItems = nextSectionIndex === -1 ? nextItems : nextItems.slice(0, nextSectionIndex);
      return sectionItems.some((i) => !('section' in i) && can(i.permission));
    }
    return can(item.permission);
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Fidati Admin</h1>
          <p>Pannello interno enterprise</p>
        </div>
        <nav className="sidebar-nav">
          {visibleNav.map((item, index) =>
            'section' in item ? (
              <div key={`section-${index}`} className="nav-section">
                {item.section}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()} style={{ width: '100%' }}>
            <LogOut size={14} /> Esci
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <GlobalSearch />
          <AdminProfileMenu />
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { NAV_PERMISSIONS };
