import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { RoleSwitcher } from '../shared/RoleSwitcher';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <RoleSwitcher />
    </div>
  );
};
