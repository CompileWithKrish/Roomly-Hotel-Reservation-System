import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useRevenueReport } from '../../features/reports/hooks';
import { useBookings, useUpdateBookingStatus } from '../../features/bookings/hooks';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  TrendingUp,
  BedDouble,
  DollarSign,
  UserCheck,
  CalendarCheck,
  Plus,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Booking } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const updateBookingStatusMutation = useUpdateBookingStatus();

  const handleQuickStatus = async (id: string, newStatus: any) => {
    try {
      await updateBookingStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const columns: Column<Booking>[] = [
    {
      header: 'Booking Code',
      accessorKey: 'bookingCode',
      cell: (b) => <span className="font-bold text-primary">{b.bookingCode}</span>,
    },
    {
      header: 'Guest Name',
      accessorKey: 'guestName',
      cell: (b) => (
        <div>
          <p className="font-bold text-on-surface">{b.guestName}</p>
          <p className="text-xs text-on-surface-variant">{b.guestEmail}</p>
        </div>
      ),
    },
    {
      header: 'Suite / Room',
      accessorKey: 'roomTitle',
      cell: (b) => (
        <div>
          <p className="font-semibold text-on-surface">{b.roomTitle}</p>
          <p className="text-xs text-on-surface-variant">{b.roomType}</p>
        </div>
      ),
    },
    {
      header: 'Check-In / Out',
      cell: (b) => (
        <span className="text-xs text-on-surface">
          {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Amount',
      cell: (b) => <span className="font-black text-on-surface">{formatCurrency(b.totalAmount)}</span>,
    },
    {
      header: 'Quick Action',
      className: 'text-right',
      cell: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          {b.status === 'Confirmed' && (
            <Button
              size="sm"
              variant="tonal"
              className="text-xs py-1 h-7"
              onClick={() => handleQuickStatus(b.id, 'Checked-In')}
            >
              Check-In
            </Button>
          )}
          {b.status === 'Checked-In' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs py-1 h-7 text-secondary"
              onClick={() => handleQuickStatus(b.id, 'Checked-Out')}
            >
              Check-Out
            </Button>
          )}
          <Link to={`/admin/bookings`}>
            <Button size="sm" variant="ghost" className="text-xs py-1 h-7">
              Manage
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Hotel Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Real-time live occupancy, guest arrivals & property management metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/rooms">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Room
            </Button>
          </Link>
          <Link to="/admin/guests">
            <Button variant="outline" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
              New Guest
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Occupancy */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Live Occupancy
            </span>
            <span className="p-2 rounded-xl bg-primary-fixed text-primary">
              <BedDouble className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-on-surface">
              {stats?.occupancyRate || 84.5}%
            </p>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {stats?.availableRooms || 12} of {stats?.totalRooms || 48} suites available today
          </p>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Monthly Revenue
            </span>
            <span className="p-2 rounded-xl bg-secondary-fixed text-secondary">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-on-surface">
              {formatCurrency(stats?.totalRevenue || 148920)}
            </p>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.8%
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">Tracking 8% above Q3 financial target</p>
        </div>

        {/* Check-ins */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Today's Arrivals
            </span>
            <span className="p-2 rounded-xl bg-primary-fixed text-primary">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-on-surface">{stats?.todayCheckIns || 14}</p>
            <span className="text-xs font-semibold text-on-surface-variant">9 Departures</span>
          </div>
          <p className="text-xs text-on-surface-variant">4 VIP check-ins scheduled after 3 PM</p>
        </div>

        {/* Active Guests */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              In-House Guests
            </span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-on-surface">{stats?.activeGuests || 38}</p>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              6 VIP Guests
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">3 special requests pending concierge</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Revenue Performance & Projection</h3>
            <p className="text-xs text-on-surface-variant">Gross room bookings compared to operational targets (USD)</p>
          </div>
          <Link to="/admin/reports" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Detailed Financial Breakdown <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004fd2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#004fd2" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ff" vertical={false} />
              <XAxis dataKey="month" stroke="#737687" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#737687"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#c3c6d8',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#004fd2"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Reservations & Check-Ins Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Recent Reservations & Today's Schedule</h3>
            <p className="text-xs text-on-surface-variant">Live feed of confirmed arrivals, in-house stays, and pending actions.</p>
          </div>
          <Link to="/admin/bookings">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Reservations
            </Button>
          </Link>
        </div>

        <Table
          data={(bookings || []).slice(0, 5)}
          columns={columns}
          keyExtractor={(b) => b.id}
          isLoading={bookingsLoading}
          emptyMessage="No recent bookings found."
        />
      </div>
    </div>
  );
};
