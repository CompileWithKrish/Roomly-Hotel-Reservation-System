import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex items-start space-x-2.5 select-none">
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            type="checkbox"
            ref={ref}
            id={inputId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded border border-outline-variant bg-surface-container-lowest transition-all duration-150',
              'peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center text-on-primary',
              'peer-focus:ring-2 peer-focus:ring-primary/20 peer-focus:border-primary',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed cursor-pointer',
              error && 'border-error',
              className
            )}
          >
            <Check className="w-3.5 h-3.5 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {(label || description) && (
          <div className="text-sm">
            {label && (
              <label htmlFor={inputId} className="font-medium text-on-surface cursor-pointer">
                {label}
              </label>
            )}
            {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
            {error && <p className="text-xs text-error font-medium mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
