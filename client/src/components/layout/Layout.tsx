import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPracticeRoute = location.pathname.startsWith('/practice');
  const isSystemRoute = location.pathname.startsWith('/system');

  if (isSystemRoute) {
    return <main className="min-h-screen bg-dark-950">{children}</main>;
  }

  return (
    <main className="app-stage">
      <div className="phone-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {children}
        {!isPracticeRoute && <BottomNav />}
      </div>
    </main>
  );
};
