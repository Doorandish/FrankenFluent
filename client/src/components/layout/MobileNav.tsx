import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export const MobileNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/roadmap', icon: Map, label: 'Roadmap' },
    { to: '/mistakes', icon: BookOpen, label: 'Mistakes' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-950/80 backdrop-blur-lg border-t border-dark-800 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
            isActive ? "text-brand-500" : "text-dark-500 hover:text-dark-300"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
