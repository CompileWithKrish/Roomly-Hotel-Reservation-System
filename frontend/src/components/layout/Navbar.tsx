import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Calendar,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms & Suites', path: '/rooms' },
    { name: 'Amenities', path: '/rooms?tab=amenities' },
    { name: 'Offers', path: '/offers' },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-on-surface flex items-center">
              Roomly<span className="text-primary text-3xl leading-none">.</span>
            </span>
            <span className="block text-[10px] tracking-widest uppercase font-semibold text-on-surface-variant -mt-1">
              Luxury Hotel & Suites
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isOffers = link.path === '/offers';
            const isActive =
              location.pathname === link.path ||
              (isOffers && (location.pathname === '/offers' || location.search.includes('filter=featured')));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-outline-variant/60 hover:bg-surface-container transition-all"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border border-primary/20"
                />
                <div className="text-left text-xs">
                  <p className="font-semibold text-on-surface leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-on-surface-variant capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest shadow-xl border border-outline-variant/60 py-2 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-outline-variant/40">
                    <p className="text-xs text-on-surface-variant">Signed in as</p>
                    <p className="text-sm font-semibold text-on-surface truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/customer/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    My Bookings
                  </Link>

                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-secondary" />
                      Admin Console
                    </Link>
                  ) : (
                    <button
                      onClick={() => switchRole('admin')}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-secondary" />
                      Switch to Admin Mode
                    </button>
                  )}

                  <div className="border-t border-outline-variant/40 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-container/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          <Link to="/rooms">
            <Button variant="primary" size="md" className="shadow-md">
              Book a Room
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-outline-variant/60 bg-surface-container-lowest px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-on-surface hover:bg-surface-container"
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-outline-variant/40 pt-3 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10"
                >
                  My Dashboard & Bookings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:bg-secondary/10"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-error hover:bg-error-container/50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
