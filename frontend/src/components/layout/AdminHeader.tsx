import React from 'react';
import { Menu, Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AdminHeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMenuToggle,
  title = 'Console',
  subtitle = 'Overview & Hotel Operations',
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-on-surface-variant hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live system pulse */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PMS Live & Synchronized</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface-container-lowest" />
        </button>

        {/* Admin profile badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/50">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover border border-primary/40 shadow-sm"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-on-surface leading-tight">{user?.name}</p>
            <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> System Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
