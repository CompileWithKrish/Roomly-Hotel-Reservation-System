import React, { useState } from 'react';
import { useBookings, useUpdateBookingStatus, useCancelBooking } from '../../features/bookings/hooks';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Calendar,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Booking, BookingStatus } from '../../types';

export const AdminBookingsPage: React.FC = () => {
  const { data: bookings, isLoading } = useBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const tabs = [
    { id: 'all', label: 'All Bookings', badge: bookings?.length },
    {
      id: 'Confirmed',
      label: 'Confirmed',
      badge: bookings?.filter((b) => b.status === 'Confirmed').length,
    },
    {
      id: 'Checked-In',
      label: 'Checked-In',
      badge: bookings?.filter((b) => b.status === 'Checked-In').length,
    },
    {
      id: 'Pending',
      label: 'Pending Approval',
      badge: bookings?.filter((b) => b.status === 'Pending').length,
    },
    {
      id: 'Checked-Out',
      label: 'Completed',
      badge: bookings?.filter((b) => b.status === 'Checked-Out').length,
    },
    {
      id: 'Cancelled',
      label: 'Cancelled',
      badge: bookings?.filter((b) => b.status === 'Cancelled').length,
    },
  ];

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err: any) {
      alert('Error changing status: ' + err.message);
    }
  };

  const filteredBookings = (bookings || []).filter((b) => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.roomTitle.toLowerCase().includes(q) ||
        b.guestEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<Booking>[] = [
    {
      header: 'Booking Code',
      accessorKey: 'bookingCode',
      cell: (b) => <span className="font-bold text-primary">{b.bookingCode}</span>,
    },
    {
      header: 'Guest Details',
      cell: (b) => (
        <div>
          <p className="font-bold text-on-surface">{b.guestName}</p>
          <p className="text-xs text-on-surface-variant">{b.guestEmail} • {b.guestPhone}</p>
        </div>
      ),
    },
    {
      header: 'Suite Reserved',
      cell: (b) => (
        <div className="flex items-center gap-2.5">
          <img
            src={b.roomImage}
            alt={b.roomTitle}
            className="w-10 h-10 rounded-lg object-cover border border-outline-variant/60 shrink-0"
          />
          <div>
            <p className="font-semibold text-on-surface text-xs leading-tight">{b.roomTitle}</p>
            <p className="text-[11px] text-on-surface-variant">{b.nights} nights • {b.guestsCount} guests</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Stay Window',
      cell: (b) => (
        <span className="text-xs text-on-surface font-medium">
          {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
        </span>
      ),
    },
    {
      header: 'Amount & Payment',
      cell: (b) => (
        <div>
          <p className="font-bold text-on-surface">{formatCurrency(b.totalAmount)}</p>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">{b.paymentStatus}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="p-1.5 h-8 text-xs gap-1"
            onClick={() => setSelectedBooking(b)}
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Button>

          {b.status === 'Confirmed' && (
            <Button
              size="sm"
              variant="tonal"
              className="h-8 text-xs"
              onClick={() => handleStatusChange(b.id, 'Checked-In')}
            >
              Check-In
            </Button>
          )}

          {b.status === 'Checked-In' && (
            <Button
              size="sm"
              variant="primary"
              className="h-8 text-xs bg-secondary hover:bg-secondary/95"
              onClick={() => handleStatusChange(b.id, 'Checked-Out')}
            >
              Check-Out
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">
            Booking & Reservation Management
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Track stay lifecycles, manage check-in arrival clearances, and process payments.
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by code, guest name, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredBookings}
        columns={columns}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        emptyMessage="No reservations match the criteria."
      />

      {/* Details & Status Modifier Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Reservation Details: ${selectedBooking?.bookingCode}`}
        description="Comprehensive stay summary, guest contact, and state manager."
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBooking.roomImage}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-base font-bold text-on-surface">{selectedBooking.roomTitle}</h4>
                  <p className="text-xs text-on-surface-variant">
                    {formatDate(selectedBooking.checkIn)} — {formatDate(selectedBooking.checkOut)} ({selectedBooking.nights} nights)
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
                <span className="font-bold text-on-surface">Guest Profile</span>
                <p className="text-sm font-bold text-primary mt-1">{selectedBooking.guestName}</p>
                <p className="text-on-surface-variant">{selectedBooking.guestEmail}</p>
                <p className="text-on-surface-variant">{selectedBooking.guestPhone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
                <span className="font-bold text-on-surface">Financials</span>
                <p className="text-sm font-black text-on-surface mt-1">{formatCurrency(selectedBooking.totalAmount)}</p>
                <p className="text-on-surface-variant">Paid via {selectedBooking.paymentMethod}</p>
                <p className="text-emerald-700 font-bold uppercase">{selectedBooking.paymentStatus}</p>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1">
                <span className="text-xs font-bold text-on-surface">Guest Special Requests</span>
                <p className="text-xs text-on-surface-variant italic">{selectedBooking.specialRequests}</p>
              </div>
            )}

            {/* Lifecycle Status Buttons */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/40">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Update Reservation Status
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedBooking.status === 'Confirmed' ? 'primary' : 'outline'}
                  onClick={() => handleStatusChange(selectedBooking.id, 'Confirmed')}
                >
                  Confirmed
                </Button>
                <Button
                  size="sm"
                  variant={selectedBooking.status === 'Checked-In' ? 'primary' : 'outline'}
                  onClick={() => handleStatusChange(selectedBooking.id, 'Checked-In')}
                >
                  Checked-In
                </Button>
                <Button
                  size="sm"
                  variant={selectedBooking.status === 'Checked-Out' ? 'primary' : 'outline'}
                  onClick={() => handleStatusChange(selectedBooking.id, 'Checked-Out')}
                >
                  Checked-Out
                </Button>
                <Button
                  size="sm"
                  variant={selectedBooking.status === 'Cancelled' ? 'danger' : 'outline'}
                  className={selectedBooking.status !== 'Cancelled' ? 'text-error' : ''}
                  onClick={() => handleStatusChange(selectedBooking.id, 'Cancelled')}
                >
                  Cancelled
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/40">
              <Button variant="primary" onClick={() => setSelectedBooking(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
