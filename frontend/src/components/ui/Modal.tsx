import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/60 z-10 my-8 overflow-hidden transition-all',
          sizeClasses[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/40 bg-surface-container-low/50">
            <div>
              {title && <h2 className="text-xl font-bold text-on-surface tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-on-surface-variant mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors ml-4 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
