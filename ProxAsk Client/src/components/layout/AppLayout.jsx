import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './navbar/Navbar';
import Sidebar from './sidebar/Sidebar';
import MobileNav from './mobileNav/MobileNav';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isGuest = !user;

  return (
    <div className={`px-layout ${isGuest ? 'px-layout--guest' : ''}`}>
      <Navbar onToggleMobileSidebar={isGuest ? null : () => setIsMobileSidebarOpen(prev => !prev)} />
      <div className="px-layout__body">
        {!isGuest && (
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}
        <main className={`px-layout__content ${isGuest ? 'px-layout__content--guest' : ''}`}>
          <div className="px-layout__content-inner">
            {children || <Outlet />}
          </div>
        </main>
      </div>
      {!isGuest && <MobileNav />}
    </div>
  );
};

export default AppLayout;
