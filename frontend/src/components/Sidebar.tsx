import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Candidatos', path: '/candidates' },
  { label: 'Usuarios', path: '/users', adminOnly: true },
  { label: 'Sectores', path: '/sectors', adminOnly: true },
  { label: 'Tipos de puesto', path: '/jobtypes', adminOnly: true },
];

export function Sidebar(): JSX.Element {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-60 bg-gray-900 text-gray-200 fixed top-14 left-0 bottom-0 overflow-y-auto z-30">
      <nav className="py-4" aria-label="Menú principal">
        <ul className="flex flex-col">
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
