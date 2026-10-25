import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pills',
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn('border-b border-outline-variant/60 flex space-x-6', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'py-3.5 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-all select-none',
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5 p-1 bg-surface-container rounded-xl overflow-x-auto select-none', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 whitespace-nowrap',
              isActive
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                  isActive ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
