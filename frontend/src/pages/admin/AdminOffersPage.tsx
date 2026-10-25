import React, { useState } from 'react';
import {
  useAdminOffers,
  useOfferStats,
  useCreateOffer,
  useUpdateOffer,
  useToggleOfferStatus,
  useDeleteOffer,
} from '../../features/offers/hooks';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  Calendar,
  CreditCard,
  Building2,
  AlertTriangle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Offer, DiscountType } from '../../types';

export const AdminOffersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<'all' | DiscountType>('all');

  // Queries
  const { data: stats } = useOfferStats();
  const { data: offersData, isLoading } = useAdminOffers({
    search: search || undefined,
    bank: bankFilter !== 'all' ? bankFilter : undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    discountType: discountTypeFilter !== 'all' ? discountTypeFilter : undefined,
    size: 50,
  });

  // Mutations
  const createOfferMutation = useCreateOffer();
  const updateOfferMutation = useUpdateOffer();
  const toggleStatusMutation = useToggleOfferStatus();
  const deleteOfferMutation = useDeleteOffer();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteConfirmOffer, setDeleteConfirmOffer] = useState<Offer | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    bankName: 'HDFC Bank',
    cardNetwork: 'Visa / Mastercard',
    cardType: 'Credit Card',
    description: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 10,
    maxDiscount: 100,
    minBookingAmount: 300,
    startDateTime: new Date().toISOString().split('T')[0],
    expiryDateTime: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    maxTotalRedemptions: 500,
    maxPerCustomerRedemptions: 1,
    termsAndConditions: 'Valid on bookings made directly on Roomly. Minimum spend applies.',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setActionError(null);
    setFormData({
      code: `OFFER${Math.floor(10 + Math.random() * 89)}`,
      title: '',
      bankName: 'HDFC Bank',
      cardNetwork: 'Visa / Mastercard',
      cardType: 'Credit Card',
      description: 'Exclusive limited-time credit card discount on Roomly luxury suites.',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscount: 100,
      minBookingAmount: 300,
      startDateTime: new Date().toISOString().split('T')[0],
      expiryDateTime: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      maxTotalRedemptions: 500,
      maxPerCustomerRedemptions: 1,
      termsAndConditions: 'Valid on direct reservations. Applicable to credit cards only. Non-transferable.',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setActionError(null);
    setFormData({
      code: offer.code,
      title: offer.title,
      bankName: offer.bankName,
      cardNetwork: offer.cardNetwork,
      cardType: offer.cardType,
      description: offer.description || '',
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      maxDiscount: offer.maxDiscount || 0,
      minBookingAmount: offer.minBookingAmount,
      startDateTime: offer.startDateTime ? offer.startDateTime.split('T')[0] : '',
      expiryDateTime: offer.expiryDateTime ? offer.expiryDateTime.split('T')[0] : '',
      maxTotalRedemptions: offer.maxTotalRedemptions,
      maxPerCustomerRedemptions: offer.maxPerCustomerRedemptions,
      termsAndConditions: offer.termsAndConditions || '',
      isActive: offer.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    try {
      const payload = {
        ...formData,
        startDateTime: new Date(formData.startDateTime).toISOString(),
        expiryDateTime: new Date(`${formData.expiryDateTime}T23:59:59Z`).toISOString(),
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.discountType === 'PERCENTAGE' && formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        minBookingAmount: Number(formData.minBookingAmount),
        maxTotalRedemptions: Number(formData.maxTotalRedemptions),
        maxPerCustomerRedemptions: Number(formData.maxPerCustomerRedemptions),
      };

      if (editingOffer) {
        await updateOfferMutation.mutateAsync({
          id: editingOffer.id,
          data: payload,
        });
      } else {
        await createOfferMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || 'Error saving offer. Please check field inputs.');
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: offer.id,
        isActive: !offer.isActive,
      });
    } catch (err: any) {
      alert('Failed to update offer status: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmOffer) return;
    try {
      await deleteOfferMutation.mutateAsync(deleteConfirmOffer.id);
      setDeleteConfirmOffer(null);
    } catch (err: any) {
      alert('Error deleting/archiving offer: ' + err.message);
    }
  };

  const columns: Column<Offer>[] = [
    {
      header: 'Offer & Code',
      cell: (o) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-black text-xs tracking-wider">
              {o.code}
            </span>
            {o.isArchived && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-bold text-on-surface-variant">
                Archived
              </span>
            )}
          </div>
          <p className="font-bold text-on-surface text-sm mt-1">{o.title}</p>
          <p className="text-xs text-on-surface-variant line-clamp-1">{o.description}</p>
        </div>
      ),
    },
    {
      header: 'Bank & Network',
      cell: (o) => (
        <div className="space-y-0.5">
          <p className="font-bold text-on-surface flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-primary" /> {o.bankName}
          </p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-secondary" /> {o.cardNetwork} ({o.cardType})
          </p>
        </div>
      ),
    },
    {
      header: 'Discount Rule',
      cell: (o) => (
        <div className="space-y-0.5">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            {o.discountType === 'PERCENTAGE'
              ? `${o.discountValue}% OFF${o.maxDiscount ? ` (Cap: ${formatCurrency(o.maxDiscount)})` : ''}`
              : `Flat ${formatCurrency(o.discountValue)} OFF`}
          </span>
          <p className="text-[11px] text-on-surface-variant">
            Min Spend: <span className="font-bold text-on-surface">{formatCurrency(o.minBookingAmount)}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Redemptions',
      cell: (o) => {
        const percent = Math.min(100, Math.round((o.currentRedemptions / o.maxTotalRedemptions) * 100));
        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>{o.currentRedemptions}</span>
              <span className="text-on-surface-variant">/ {o.maxTotalRedemptions}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percent > 85 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant">Limit {o.maxPerCustomerRedemptions}/guest</p>
          </div>
        );
      },
    },
    {
      header: 'Validity Period',
      cell: (o) => (
        <div className="text-xs space-y-0.5">
          <p className="text-on-surface font-semibold">{formatDate(o.startDateTime)}</p>
          <p className="text-on-surface-variant text-[11px]">to {formatDate(o.expiryDateTime)}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (o) => (
        <button
          onClick={() => handleToggleStatus(o)}
          title="Click to toggle status"
          className="flex items-center gap-1.5 focus:outline-none"
        >
          {o.isActive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <XCircle className="w-3.5 h-3.5 text-outline" /> Inactive
            </span>
          )}
        </button>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenEdit(o)}
            title="Edit Offer"
            className="p-1.5 h-8 w-8"
          >
            <Edit2 className="w-4 h-4 text-primary" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirmOffer(o)}
            title={o.currentRedemptions > 0 ? 'Archive Offer' : 'Delete Offer'}
            className="p-1.5 h-8 w-8 text-error hover:bg-error-container/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Offers & Promotions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              Credit Card Specials
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Administer limited-time bank co-branded savings, redemption thresholds, and instant discounts.
          </p>
        </div>

        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Create Credit Card Offer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Active Campaigns
            </span>
            <p className="text-2xl font-black text-on-surface mt-1">{stats?.activeOffers || 0}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Live on Checkout</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
            <Tag className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total Redemptions
            </span>
            <p className="text-2xl font-black text-on-surface mt-1">{stats?.totalRedemptions || 0}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Verified bookings</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-secondary" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total Customer Savings
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {formatCurrency(stats?.totalDiscountGranted || 0)}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Instant savings granted</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total Offers Configured
            </span>
            <p className="text-2xl font-black text-on-surface mt-1">{stats?.totalOffers || 0}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">All banking partners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Search by offer code, title, or bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/80 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/80 text-xs font-medium text-on-surface focus:outline-none"
          >
            <option value="all">All Banking Partners</option>
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
            <option value="ICICI Bank">ICICI Bank</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/80 text-xs font-medium text-on-surface focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Campaigns</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={discountTypeFilter}
            onChange={(e) => setDiscountTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/80 text-xs font-medium text-on-surface focus:outline-none"
          >
            <option value="all">All Discount Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="rounded-2xl border border-outline-variant/60 overflow-hidden bg-surface-container-lowest shadow-sm">
        <Table
          columns={columns}
          data={offersData?.content || []}
          isLoading={isLoading}
          keyExtractor={(o) => o.id}
          emptyMessage="No offers matching your search criteria found. Click 'Create Credit Card Offer' to launch a campaign."
        />
      </div>

      {/* Create / Edit Offer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? `Edit Offer: ${editingOffer.code}` : 'Create Limited-Time Credit Card Offer'}
        description="Configure bank eligibility, discount ceilings, and validity parameters."
        size="lg"
      >
        <form onSubmit={handleSaveOffer} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Offer Code *"
              placeholder="e.g. HDFC10"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              disabled={!!editingOffer}
              required
            />
            <Input
              label="Bank Partner Name *"
              placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Campaign Title *"
            placeholder="e.g. HDFC Bank Credit Card — 10% Instant Savings"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Card Network *"
              placeholder="e.g. Visa / Mastercard / RuPay"
              value={formData.cardNetwork}
              onChange={(e) => setFormData({ ...formData, cardNetwork: e.target.value })}
              required
            />
            <Input
              label="Card Category *"
              placeholder="e.g. Credit Card, Corporate, Elite"
              value={formData.cardType}
              onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              </select>
            </div>
            <Input
              label={formData.discountType === 'PERCENTAGE' ? 'Discount % *' : 'Discount Amount ($) *'}
              type="number"
              step="0.01"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
              required
            />
            {formData.discountType === 'PERCENTAGE' && (
              <Input
                label="Max Discount Cap ($)"
                type="number"
                step="0.01"
                placeholder="e.g. 100"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Booking Amount ($) *"
              type="number"
              step="0.01"
              value={formData.minBookingAmount}
              onChange={(e) => setFormData({ ...formData, minBookingAmount: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Total Redemptions Cap *"
              type="number"
              value={formData.maxTotalRedemptions}
              onChange={(e) => setFormData({ ...formData, maxTotalRedemptions: parseInt(e.target.value) || 100 })}
              required
            />
            <Input
              label="Per-Customer Limit *"
              type="number"
              value={formData.maxPerCustomerRedemptions}
              onChange={(e) => setFormData({ ...formData, maxPerCustomerRedemptions: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Campaign Start Date *"
              type="date"
              value={formData.startDateTime}
              onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
              required
            />
            <Input
              label="Campaign Expiry Date *"
              type="date"
              value={formData.expiryDateTime}
              onChange={(e) => setFormData({ ...formData, expiryDateTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Highlight key guest benefits..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Terms & Conditions</label>
            <textarea
              rows={2}
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              placeholder="Applicable terms, payment conditions, cancellation caveats..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="offer-active-check"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
            />
            <label htmlFor="offer-active-check" className="text-xs font-bold text-on-surface cursor-pointer">
              Activate Offer immediately on checkout
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createOfferMutation.isPending || updateOfferMutation.isPending}
            >
              {editingOffer ? 'Save Changes' : 'Launch Offer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmOffer}
        onClose={() => setDeleteConfirmOffer(null)}
        title={deleteConfirmOffer && deleteConfirmOffer.currentRedemptions > 0 ? 'Archive Campaign' : 'Delete Offer'}
        description="Review campaign deletion details."
      >
        <div className="space-y-4">
          {deleteConfirmOffer && deleteConfirmOffer.currentRedemptions > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" /> Offer Has Historical Redemptions
              </p>
              <p>
                This offer has been redeemed <strong>{deleteConfirmOffer.currentRedemptions} times</strong>. To preserve audit integrity and reservation history, it will be safely <strong>archived and deactivated</strong> from customer checkout rather than permanently deleted.
              </p>
            </div>
          ) : (
            <p className="text-sm text-on-surface">
              Are you sure you want to permanently delete offer <strong>{deleteConfirmOffer?.code}</strong>? This action cannot be undone.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <Button variant="outline" onClick={() => setDeleteConfirmOffer(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteOfferMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteConfirmOffer && deleteConfirmOffer.currentRedemptions > 0 ? 'Confirm Archive' : 'Delete Offer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
