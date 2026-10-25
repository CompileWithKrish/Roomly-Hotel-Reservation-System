import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Award, Star } from 'lucide-react';
import { RoleSwitcher } from '../shared/RoleSwitcher';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-on-surface">
      {/* Form Area */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-on-surface">
              Roomly<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-8">
          <Outlet />
        </div>

        <div className="text-xs text-on-surface-variant flex items-center justify-between border-t border-outline-variant/40 pt-4">
          <p>© {new Date().getFullYear()} Roomly Luxury Hospitality.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-primary">Back to Home</Link>
            <a href="#" className="hover:text-primary">Help & Support</a>
          </div>
        </div>
      </div>

      {/* Hero Visual Column */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(19, 27, 46, 0.4), rgba(19, 27, 46, 0.85)), url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80')`
        }}
      >
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-300" />
            Forbes 5-Star Hotel 2026
          </div>
        </div>

        <div className="space-y-6 text-white max-w-lg">
          <div className="flex gap-1 text-amber-300">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            "An unmatched sanctuary where architectural beauty and bespoke hospitality intertwine seamlessly."
          </h2>
          <div>
            <p className="font-bold text-base">Architectural Digest Luxury Stays</p>
            <p className="text-white/75 text-xs">Global Hospitality Review 2026</p>
          </div>
        </div>
      </div>
      <RoleSwitcher />
    </div>
  );
};
