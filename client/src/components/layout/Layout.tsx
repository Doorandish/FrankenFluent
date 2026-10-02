import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPracticeRoute = location.pathname.startsWith('/practice');

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col md:flex-row">
      {!isPracticeRoute && <Sidebar />}
      
      <main className={`flex-1 w-full ${!isPracticeRoute ? 'md:pl-64' : ''} ${!isPracticeRoute ? 'pb-16 md:pb-0' : ''}`}>
        <div className="max-w-7xl mx-auto h-full min-h-screen flex flex-col">
          {children}
        </div>
      </main>

      {!isPracticeRoute && <MobileNav />}
    </div>
  );
};
