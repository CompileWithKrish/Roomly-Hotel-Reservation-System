import React from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found',
  className,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/60 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">Loading records...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/60 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline mb-3">
            <span className="material-symbols-outlined text-2xl">folder_off</span>
          </div>
          <p className="text-base font-semibold text-on-surface">{emptyMessage}</p>
          <p className="text-xs text-on-surface-variant mt-1">There are no items matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm', className)}>
      <table className="w-full text-left text-sm text-on-surface">
        <thead className="bg-surface-container-low/70 border-b border-outline-variant/60 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={cn('px-5 py-3.5', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/40">
          {data.map((item, rowIdx) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                'transition-colors hover:bg-surface-container/40',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={cn('px-5 py-4 whitespace-nowrap', col.className)}>
                  {col.cell
                    ? col.cell(item, rowIdx)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
