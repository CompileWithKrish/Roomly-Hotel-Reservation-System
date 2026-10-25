import React, { useState } from 'react';
import { useGuests, useCreateGuest, useUpdateGuest, useDeleteGuest } from '../../features/guests/hooks';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Star,
  Award,
  ShieldCheck,
  Check,
  Globe,
  Tag,
} from 'lucide-react';
import { Guest, GuestTier } from '../../types';

export const AdminGuestsPage: React.FC = () => {
  const { data: guests, isLoading } = useGuests();
  const createGuestMutation = useCreateGuest();
  const updateGuestMutation = useUpdateGuest();
  const deleteGuestMutation = useDeleteGuest();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteConfirmGuest, setDeleteConfirmGuest] = useState<Guest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'United States',
    passportId: '',
    tier: 'Regular' as GuestTier,
    status: 'Active' as 'Active' | 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    notes: '',
    preferences: ['Quiet Room', 'High Floor'],
  });

  const availablePreferences = [
    'Quiet Room',
    'High Floor',
    'Late Checkout',
    'Feather Pillows',
    'Champagne on Arrival',
    'Executive Lounge',
    'Private Villa',
    'Limousine Transfer',
  ];

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: 'United States',
      passportId: `US${Math.floor(1000000 + Math.random() * 9000000)}X`,
      tier: 'Regular',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      notes: '',
      preferences: ['Quiet Room', 'Late Checkout'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      nationality: guest.nationality,
      passportId: guest.passportId,
      tier: guest.tier,
      status: guest.status,
      avatar: guest.avatar || '',
      notes: guest.notes || '',
      preferences: guest.preferences || [],
    });
    setIsModalOpen(true);
  };

  const handleTogglePreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }));
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await updateGuestMutation.mutateAsync({
          id: editingGuest.id,
          updates: formData,
        });
      } else {
        await createGuestMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error saving guest: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmGuest) return;
    try {
      await deleteGuestMutation.mutateAsync(deleteConfirmGuest.id);
      setDeleteConfirmGuest(null);
    } catch (err: any) {
      alert('Error removing guest: ' + err.message);
    }
  };

  const filteredGuests = (guests || []).filter((g) => {
    if (tierFilter !== 'all' && g.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        g.firstName.toLowerCase().includes(q) ||
        g.lastName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.passportId.toLowerCase().includes(q) ||
        g.nationality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<Guest>[] = [
    {
      header: 'Guest',
      cell: (g) => (
        <div className="flex items-center gap-3">
          <img
            src={g.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
          />
          <div>
            <p className="font-bold text-on-surface">
              {g.firstName} {g.lastName}
            </p>
            <p className="text-xs text-on-surface-variant">{g.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact & Origin',
      cell: (g) => (
        <div>
          <p className="text-xs text-on-surface font-medium">{g.phone}</p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <Globe className="w-3 h-3" /> {g.nationality} ({g.passportId})
          </p>
        </div>
      ),
    },
    {
      header: 'Tier',
      cell: (g) => {
        const tierVariants: Record<GuestTier, any> = {
          VIP: 'primary',
          Gold: 'warning',
          Silver: 'neutral',
          Regular: 'default',
        };
        return (
          <Badge variant={tierVariants[g.tier]} dot>
            {g.tier} Tier
          </Badge>
        );
      },
    },
    {
      header: 'Stays & Spend',
      cell: (g) => (
        <div>
          <p className="font-bold text-on-surface">{formatCurrency(g.totalSpent)}</p>
          <p className="text-xs text-on-surface-variant">{g.totalStays} Lifetime Stays</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (g) => <StatusBadge status={g.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (g) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="p-1.5 h-8 w-8"
            onClick={() => handleOpenEdit(g)}
            title="Edit Guest Profile"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-1.5 h-8 w-8 text-error hover:bg-error-container/40"
            onClick={() => setDeleteConfirmGuest(g)}
            title="Delete Guest"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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
            Guest Directory & Privilege CRM
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Manage VIP statuses, passport records, lifetime expenditure, and stay preferences.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
          Add New Guest
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, phone, or passport ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-semibold text-on-surface focus:outline-none"
        >
          <option value="all">All Loyalty Tiers</option>
          <option value="VIP">VIP Tier Only</option>
          <option value="Gold">Gold Tier Only</option>
          <option value="Silver">Silver Tier Only</option>
          <option value="Regular">Regular Guests</option>
        </select>
      </div>

      {/* Table */}
      <Table
        data={filteredGuests}
        columns={columns}
        keyExtractor={(g) => g.id}
        isLoading={isLoading}
        emptyMessage="No guests found in directory."
      />

      {/* Add / Edit Guest Modal (Stitch Screen 09) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? `Edit Guest: ${formData.firstName} ${formData.lastName}` : 'Add New Guest Record'}
        description="Configure guest credentials, identification, loyalty tier and bespoke preferences."
        size="xl"
      >
        <form onSubmit={handleSaveGuest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Mobile Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              required
            />
            <Input
              label="Passport / ID Number"
              value={formData.passportId}
              onChange={(e) => setFormData({ ...formData, passportId: e.target.value })}
              required
            />
            <Select
              label="Loyalty Tier"
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
            >
              <option value="Regular">Regular</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="VIP">VIP Exclusive</option>
            </Select>
          </div>

          {/* Stay Preferences Tags */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Personalized Stay Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {availablePreferences.map((pref) => {
                const isSelected = formData.preferences.includes(pref);
                return (
                  <button
                    type="button"
                    key={pref}
                    onClick={() => handleTogglePreference(pref)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Concierge Notes</label>
            <textarea
              rows={2}
              placeholder="E.g., Prefers vintage champagne, high floor, quiet corner..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createGuestMutation.isPending || updateGuestMutation.isPending}
            >
              {editingGuest ? 'Update Guest Profile' : 'Add Guest Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmGuest}
        onClose={() => setDeleteConfirmGuest(null)}
        title="Delete Guest Record"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface">
            Are you sure you want to remove <strong>{deleteConfirmGuest?.firstName} {deleteConfirmGuest?.lastName}</strong> from the guest directory?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/40">
            <Button variant="outline" onClick={() => setDeleteConfirmGuest(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteGuestMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
