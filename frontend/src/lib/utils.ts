import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export const DEFAULT_ROOM_ID = 'b0000000-0000-0000-0000-000000000101';

export function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultBookingDates(): { checkIn: string; checkOut: string } {
  const today = new Date();
  const checkInDate = new Date(today);
  checkInDate.setDate(today.getDate() + 1);

  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkInDate.getDate() + 3);

  return {
    checkIn: formatIsoDate(checkInDate),
    checkOut: formatIsoDate(checkOutDate),
  };
}

export function sanitizeBookingDates(inParam?: string | null, outParam?: string | null): { checkIn: string; checkOut: string } {
  const defaults = getDefaultBookingDates();
  if (!inParam || !outParam) {
    return defaults;
  }

  // Parse YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(inParam) || !dateRegex.test(outParam)) {
    return defaults;
  }

  const inDate = new Date(`${inParam}T00:00:00`);
  const outDate = new Date(`${outParam}T00:00:00`);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    return defaults;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check-in cannot be in the past
  if (inDate < today) {
    return defaults;
  }

  // Check-out must be after check-in
  if (outDate <= inDate) {
    const fixedOut = new Date(inDate);
    fixedOut.setDate(inDate.getDate() + 3);
    return {
      checkIn: inParam,
      checkOut: formatIsoDate(fixedOut),
    };
  }

  return {
    checkIn: inParam,
    checkOut: outParam,
  };
}
