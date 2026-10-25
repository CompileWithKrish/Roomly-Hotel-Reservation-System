import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { RoleSwitcher } from '../shared/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';
import { Calendar, UserCheck, ShieldCheck, CreditCard, BellRing } from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const customerNav = [
    { name: 'My Bookings', path: '/customer/dashboard', icon: Calendar },
    { name: 'Browse Available Rooms', path: '/rooms', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="bg-surface-container-low border-b border-outline-variant/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                    Welcome back, {user?.name || 'Valued Guest'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    ★ Gold Tier Member
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Manage your luxury stays, modify reservation preferences & access exclusive perks.
                </p>
              </div>
            </div>

            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-sm hover:bg-primary/95 transition-all"
            >
              Book Another Stay
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
      <RoleSwitcher />
    </div>
  );
};
