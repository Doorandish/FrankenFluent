import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, BookOpen, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/roadmap', icon: Map, label: 'Roadmap' },
    { to: '/mistakes', icon: BookOpen, label: 'Mistakes' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-dark-950 border-r border-dark-800 p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-2 mb-10 mt-4">
        <div className="w-8 h-8 rounded bg-brand-500 flex items-center justify-center text-white font-bold">FF</div>
        <span className="text-xl font-bold text-white tracking-tight">FrankenFluent</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
              isActive 
                ? "bg-brand-500/10 text-brand-500" 
                : "text-dark-400 hover:text-dark-100 hover:bg-dark-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto glass-card p-4 mx-2 mb-4">
        <div className="text-xs text-dark-400 mb-1">Current Level</div>
        <div className="text-lg font-bold text-white">B1 Intermediate</div>
      </div>
    </div>
  );
};
