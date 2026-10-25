import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-on-surface">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full appearance-none rounded-lg border bg-surface-container-lowest px-3.5 py-2.5 pr-10 text-sm text-on-surface focus:outline-none transition-all duration-150',
              'border-outline-variant hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20',
              error && 'border-error focus:border-error focus:ring-error/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-on-surface-variant">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
