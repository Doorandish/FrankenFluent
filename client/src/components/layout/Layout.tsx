import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPracticeRoute = location.pathname.startsWith('/practice');

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
