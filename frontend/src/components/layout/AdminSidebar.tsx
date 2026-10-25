import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  BarChart3,
  Globe,
  LogOut,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Room Management', path: '/admin/rooms', icon: BedDouble },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Guest Directory', path: '/admin/guests', icon: Users },
    { name: 'Offers & Promotions', path: '/admin/offers', icon: Tag },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-surface-container-low border-r border-outline-variant/60 select-none">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-outline-variant/40">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-on-surface">
                Roomly<span className="text-primary">.</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase font-bold text-primary -mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-on-primary' : 'text-on-surface-variant'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-outline-variant/40 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>Switch to Public Hotel Site</span>
        </Link>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-primary/30"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-on-surface leading-tight truncate max-w-[100px]">{user?.name}</p>
              <p className="text-[10px] text-on-surface-variant">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
