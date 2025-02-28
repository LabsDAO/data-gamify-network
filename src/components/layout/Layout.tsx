
import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Add safe area padding for mobile devices with notches */}
      {isMobile && (
        <div className="h-safe-bottom min-h-[20px]"></div>
      )}
    </div>
  );
};

export default Layout;
