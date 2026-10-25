import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookings, useCancelBooking } from '../../features/bookings/hooks';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Calendar,
  Sparkles,
  Download,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Booking } from '../../types';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useBookings(
    user?.role === 'customer' && user?.email ? { guestEmail: user.email } : undefined
  );
  const cancelBookingMutation = useCancelBooking();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  const tabs = [
    { id: 'all', label: 'All Reservations', badge: bookings?.length },
    {
      id: 'upcoming',
      label: 'Upcoming & Active',
      badge: bookings?.filter((b) => b.status === 'Confirmed' || b.status === 'Checked-In').length,
    },
    {
      id: 'past',
      label: 'Past Stays',
      badge: bookings?.filter((b) => b.status === 'Checked-Out').length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      badge: bookings?.filter((b) => b.status === 'Cancelled').length,
    },
  ];

  const filteredBookings = (bookings || []).filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'Confirmed' || b.status === 'Checked-In';
    if (activeTab === 'past') return b.status === 'Checked-Out';
    if (activeTab === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    try {
      await cancelBookingMutation.mutateAsync(selectedBookingForCancel.id);
      setSelectedBookingForCancel(null);
    } catch (err: any) {
      alert('Failed to cancel reservation: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Upcoming Stays
            </p>
            <p className="text-2xl font-black text-on-surface mt-1">
              {bookings?.filter((b) => b.status === 'Confirmed' || b.status === 'Checked-In').length || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Lifetime Stays
            </p>
            <p className="text-2xl font-black text-on-surface mt-1">
              {bookings?.filter((b) => b.status === 'Checked-Out').length || 0} Completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Reward Points
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {Math.round((bookings?.reduce((acc, b) => acc + (b.totalAmount || 0), 0) || 1200) * 5).toLocaleString()} pts
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <Link to="/rooms">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Explore Available Suites
          </Button>
        </Link>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-full h-44 rounded-2xl" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-16 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">No reservations found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            You do not have any reservations matching this status filter.
          </p>
          <Link to="/rooms">
            <Button variant="primary" size="sm">
              Book a Suite Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <img
                  src={booking.roomImage}
                  alt={booking.roomTitle}
                  className="w-full sm:w-36 h-28 rounded-xl object-cover border border-outline-variant/40 shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary uppercase tracking-wider">
                      {booking.bookingCode}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">{booking.roomTitle}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)} ({booking.nights} nights)
                    </span>
                  </p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{booking.guestsCount} Guests • Paid via {booking.paymentMethod}</span>
                  </p>
                  {booking.specialRequests && (
                    <p className="text-[11px] text-on-surface-variant italic bg-surface-container-low px-2 py-0.5 rounded">
                      Note: "{booking.specialRequests}"
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between border-t lg:border-t-0 border-outline-variant/40 pt-4 lg:pt-0 gap-3">
                <div className="text-left lg:text-right">
                  <span className="text-xs text-on-surface-variant">Total Paid</span>
                  <p className="text-2xl font-black text-on-surface">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FileText className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedBookingForInvoice(booking)}
                  >
                    View Invoice
                  </Button>

                  {booking.status === 'Confirmed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error hover:bg-error-container/40"
                      onClick={() => setSelectedBookingForCancel(booking)}
                    >
                      Cancel Stay
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        isOpen={!!selectedBookingForCancel}
        onClose={() => setSelectedBookingForCancel(null)}
        title="Confirm Reservation Cancellation"
        description="Please review our cancellation terms below."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <p className="font-bold">100% Full Refund Eligible</p>
              <p className="mt-0.5">
                Since your check-in is more than 48 hours away, a full refund of{' '}
                <strong>{formatCurrency(selectedBookingForCancel?.totalAmount || 0)}</strong> will be credited to your original payment method.
              </p>
            </div>
          </div>

          <p className="text-sm text-on-surface">
            Are you sure you want to cancel reservation <strong>{selectedBookingForCancel?.bookingCode}</strong> for{' '}
            <strong>{selectedBookingForCancel?.roomTitle}</strong>?
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <Button variant="outline" onClick={() => setSelectedBookingForCancel(null)}>
              Keep Reservation
            </Button>
            <Button
              variant="danger"
              isLoading={cancelBookingMutation.isPending}
              onClick={handleConfirmCancel}
            >
              Cancel Reservation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedBookingForInvoice}
        onClose={() => setSelectedBookingForInvoice(null)}
        title="Official Stay Receipt & Invoice"
        size="lg"
      >
        {selectedBookingForInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-outline-variant/40">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">Roomly Luxury Resort</h3>
                <p className="text-xs text-on-surface-variant">742 Ocean Boulevard, Marina District, CA</p>
                <p className="text-xs text-on-surface-variant">Tax ID: US-ROOMLY-992014</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-on-surface-variant">Invoice Reference</span>
                <p className="text-base font-black text-primary">{selectedBookingForInvoice.bookingCode}</p>
                <p className="text-xs text-on-surface-variant">Issued: {selectedBookingForInvoice.createdAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <p className="font-bold text-on-surface">Billed To:</p>
                <p className="mt-1 font-semibold">{selectedBookingForInvoice.guestName}</p>
                <p className="text-on-surface-variant">{selectedBookingForInvoice.guestEmail}</p>
                <p className="text-on-surface-variant">{selectedBookingForInvoice.guestPhone}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <p className="font-bold text-on-surface">Stay Summary:</p>
                <p className="mt-1">Suite: {selectedBookingForInvoice.roomTitle}</p>
                <p className="text-on-surface-variant">Check-In: {formatDate(selectedBookingForInvoice.checkIn)}</p>
                <p className="text-on-surface-variant">Check-Out: {formatDate(selectedBookingForInvoice.checkOut)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-outline-variant/40 py-4">
              <div className="flex justify-between">
                <span>Room Rate ({selectedBookingForInvoice.nights} nights)</span>
                <span className="font-semibold">{formatCurrency(selectedBookingForInvoice.baseRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hospitality & Tourism Tax (12%)</span>
                <span className="font-semibold">{formatCurrency(selectedBookingForInvoice.taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort Concierge Fee</span>
                <span className="font-semibold">{formatCurrency(selectedBookingForInvoice.serviceFee)}</span>
              </div>
              {selectedBookingForInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Privilege Membership Discount</span>
                  <span>-{formatCurrency(selectedBookingForInvoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-2 border-t border-outline-variant/40">
                <span>Total Amount Paid</span>
                <span className="text-primary text-base font-black">{formatCurrency(selectedBookingForInvoice.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Download / Print Receipt
              </Button>
              <Button variant="primary" onClick={() => setSelectedBookingForInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
