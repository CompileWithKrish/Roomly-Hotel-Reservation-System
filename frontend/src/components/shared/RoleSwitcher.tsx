import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, ShieldAlert, Sparkles, X } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {isOpen ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-2xl w-72 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/50 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Demo Persona Switcher</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => switchRole('admin')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                role === 'admin'
                  ? 'bg-primary-fixed border-primary text-on-primary-fixed font-bold shadow-sm'
                  : 'bg-surface-container-low border-outline-variant/50 text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-semibold">Hotel Administrator</p>
                  <p className="text-[10px] text-on-surface-variant">Alexander Wright</p>
                </div>
              </div>
              {role === 'admin' && <span className="text-[10px] uppercase font-bold text-primary">Active</span>}
            </button>

            <button
              onClick={() => switchRole('customer')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                role === 'customer'
                  ? 'bg-secondary-fixed border-secondary text-on-secondary-fixed font-bold shadow-sm'
                  : 'bg-surface-container-low border-outline-variant/50 text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2 text-left">
                <UserCheck className="w-4 h-4 text-secondary shrink-0" />
                <div>
                  <p className="font-semibold">Registered Guest</p>
                  <p className="text-[10px] text-on-surface-variant">Sarah Jenkins (Gold Tier)</p>
                </div>
              </div>
              {role === 'customer' && <span className="text-[10px] uppercase font-bold text-secondary">Active</span>}
            </button>

            <button
              onClick={() => logout()}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-all ${
                role === 'guest'
                  ? 'bg-surface-container-high border-outline text-on-surface font-bold'
                  : 'bg-surface-container-low border-outline-variant/50 text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="text-left pl-1">
                <p className="font-semibold">Logged Out / Visitor</p>
                <p className="text-[10px] text-on-surface-variant">Anonymous Guest</p>
              </div>
              {role === 'guest' && <span className="text-[10px] uppercase font-bold text-outline">Active</span>}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-on-surface text-surface shadow-xl hover:bg-on-surface/90 transition-transform active:scale-95 text-xs font-semibold"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Role: <strong className="capitalize text-primary-fixed">{role}</strong></span>
        </button>
      )}
    </div>
  );
};
