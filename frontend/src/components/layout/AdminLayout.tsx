import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { RoleSwitcher } from '../shared/RoleSwitcher';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-on-surface">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 overflow-y-auto">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-surface-container-low h-full z-10">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <RoleSwitcher />
    </div>
  );
};
