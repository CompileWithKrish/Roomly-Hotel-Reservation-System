import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-container-high', className)}
      {...props}
    />
  );
};
