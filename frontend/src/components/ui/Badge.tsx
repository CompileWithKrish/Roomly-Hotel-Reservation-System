import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-container text-on-surface',
    primary: 'bg-primary-fixed text-on-primary-fixed font-semibold',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed font-semibold',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-error-container text-error font-medium',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    neutral: 'bg-surface-container-high text-on-surface-variant',
    outline: 'border border-outline-variant text-on-surface bg-transparent',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-full font-medium',
  };

  const dotColors = {
    default: 'bg-outline',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-error',
    info: 'bg-sky-600',
    neutral: 'bg-on-surface-variant',
    outline: 'bg-outline',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => {
  switch (status?.toLowerCase()) {
    case 'available':
    case 'confirmed':
    case 'active':
    case 'paid':
      return (
        <Badge variant="success" dot className={className}>
          {status}
        </Badge>
      );
    case 'occupied':
    case 'checked-in':
    case 'vip':
      return (
        <Badge variant="primary" dot className={className}>
          {status}
        </Badge>
      );
    case 'reserved':
    case 'gold':
    case 'pending':
      return (
        <Badge variant="warning" dot className={className}>
          {status}
        </Badge>
      );
    case 'maintenance':
    case 'cancelled':
    case 'refunded':
    case 'inactive':
      return (
        <Badge variant="danger" dot className={className}>
          {status}
        </Badge>
      );
    case 'checked-out':
    case 'completed':
    case 'silver':
      return (
        <Badge variant="neutral" dot className={className}>
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="default" dot className={className}>
          {status}
        </Badge>
      );
  }
};
