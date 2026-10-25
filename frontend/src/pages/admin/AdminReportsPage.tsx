import React, { useState } from 'react';
import {
  useDashboardStats,
  useRevenueReport,
  useOccupancyReport,
  useBookingSources,
} from '../../features/reports/hooks';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  BedDouble,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AdminReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('q3');

  const { data: stats } = useDashboardStats();
  const { data: revenueData } = useRevenueReport();
  const { data: occupancyData } = useOccupancyReport();
  const { data: bookingSources } = useBookingSources();

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Month,Revenue,Bookings,Target\n' +
      (revenueData || []).map((r) => `${r.month},${r.revenue},${r.bookings},${r.target}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'roomly_revenue_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Financial & Operations Analytics
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Property performance indicators, ADR yield, occupancy curves, and distribution metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface focus:outline-none"
          >
            <option value="last30">Last 30 Days</option>
            <option value="q3">Q3 2026 (Active)</option>
            <option value="ytd">Year to Date (2026)</option>
            <option value="all">Full Historical</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Gross Room Revenue (YTD)
          </span>
          <p className="text-3xl font-black text-on-surface">
            {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '$1,312,920'}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +14.6% vs previous year
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Average Daily Rate (ADR)
          </span>
          <p className="text-3xl font-black text-primary">$468.50</p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +$38.20 yield increase
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            RevPAR (Per Available Room)
          </span>
          <p className="text-3xl font-black text-secondary">$395.80</p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> 84.5% effective occupancy
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Average Length of Stay (ALOS)
          </span>
          <p className="text-3xl font-black text-on-surface">3.8 Nights</p>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
            Standard: 3.4 • Villas: 6.2
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-on-surface">Monthly Revenue Growth vs Target</h3>
              <p className="text-xs text-on-surface-variant">Continuous performance vs budgeted revenue</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="w-3 h-3 rounded-full bg-primary" /> Actual Revenue
              </span>
              <span className="flex items-center gap-1.5 text-outline">
                <span className="w-3 h-3 rounded-full bg-outline-variant" /> Budget Target
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevReport" x1="0" y1="0" x2="0" y2="1">
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
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#c3c6d8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#004fd2"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevReport)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Channel Distribution (1 col) */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-on-surface">Acquisition Channels</h3>
            <p className="text-xs text-on-surface-variant">Direct web vs OTA distribution split</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingSources || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(bookingSources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-outline-variant/40">
            {(bookingSources || []).map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-on-surface font-medium">{item.name}</span>
                </span>
                <span className="font-bold text-on-surface">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occupancy by Room Category Bar Chart */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface">Occupancy Breakdown by Suite Tier</h3>
            <p className="text-xs text-on-surface-variant">Occupied units vs Available vacant suites</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e7ff" vertical={false} />
              <XAxis dataKey="roomType" stroke="#737687" fontSize={12} tickLine={false} />
              <YAxis stroke="#737687" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#c3c6d8',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="occupied" name="Occupied Suites" fill="#004fd2" radius={[6, 6, 0, 0]} />
              <Bar dataKey="available" name="Vacant Suites" fill="#89ceff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
