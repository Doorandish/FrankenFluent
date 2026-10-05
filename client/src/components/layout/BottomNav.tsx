import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, IconName } from '../common/Icon';

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'roadmap', label: 'Roadmap', icon: 'roadmap', path: '/roadmap' },
  { id: 'mistakes', label: 'Mistakes', icon: 'mistakes', path: '/mistakes' },
  { id: 'profile', label: 'Profile', icon: 'profile', path: '/profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={`nav-item pressable ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div>
              <Icon name={item.icon} size={21} />
              {isActive && <i />}
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
