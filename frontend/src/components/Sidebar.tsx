import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '▦' },
  { label: 'Candidatos', path: '/candidates', icon: '◉' },
  { label: 'Usuarios', path: '/users', icon: '◈', adminOnly: true },
  { label: 'Sectores', path: '/sectors', icon: '◫', adminOnly: true },
  { label: 'Tipos de puesto', path: '/jobtypes', icon: '◪', adminOnly: true },
];

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export function Sidebar(): JSX.Element {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside style={{
      width: '240px',
      background: '#fff',
      borderRight: '1px solid #e2e8f0',
      position: 'fixed',
      top: '56px', left: 0, bottom: 0,
      overflowY: 'auto',
      zIndex: 30,
      fontFamily: ff,
    }}>
      <nav aria-label="Menú principal" style={{ padding: '12px 0' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 20px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#2563eb' : '#475569',
                    background: isActive ? '#eff6ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#1e293b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#475569';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '16px', lineHeight: 1,
                    color: isActive ? '#2563eb' : '#94a3b8',
                    width: '20px', textAlign: 'center',
                  }}>
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px',
        borderTop: '1px solid #f1f5f9',
        fontSize: '11px', color: '#94a3b8',
      }}>
        LTI ATS · v1.0
      </div>
    </aside>
  );
}
