import React, { useState } from 'react';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '../../features/rooms/hooks';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Building2,
} from 'lucide-react';
import { Room, RoomType, RoomStatus } from '../../types';

export const AdminRoomsPage: React.FC = () => {
  const { data: rooms, isLoading } = useRooms();
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<Room | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    roomNumber: '',
    hotelName: 'Roomly Grand Banjara',
    location: 'Hyderabad',
    type: 'Deluxe Suite' as RoomType,
    description: '',
    pricePerNight: 350,
    capacity: 2,
    bedType: '1 King Bed',
    sizeSqFt: 600,
    floor: 4,
    status: 'Available' as RoomStatus,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
    amenities: ['High-Speed Wi-Fi 6', 'Panoramic City View', 'Marble Jacuzzi Bath'],
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      title: '',
      roomNumber: `${Math.floor(100 + Math.random() * 800)}`,
      hotelName: 'Roomly Grand Banjara',
      location: 'Hyderabad',
      type: 'Deluxe Suite',
      description: 'Spacious luxury suite with panoramic views and marble jacuzzi.',
      pricePerNight: 350,
      capacity: 2,
      bedType: '1 King Bed',
      sizeSqFt: 620,
      floor: 4,
      status: 'Available',
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
      amenities: ['High-Speed Wi-Fi 6', 'Panoramic City View', 'Marble Jacuzzi Bath', 'Complimentary Espresso Bar'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      title: room.title,
      roomNumber: room.roomNumber,
      hotelName: room.hotelName || 'Roomly Grand Banjara',
      location: room.location || 'Hyderabad',
      type: room.type,
      description: room.description,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      bedType: room.bedType,
      sizeSqFt: room.sizeSqFt,
      floor: room.floor,
      status: room.status,
      images: room.images,
      amenities: room.amenities,
    });
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await updateRoomMutation.mutateAsync({
          id: editingRoom.id,
          updates: formData,
        });
      } else {
        await createRoomMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error saving room: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRoom) return;
    try {
      await deleteRoomMutation.mutateAsync(deleteConfirmRoom.id);
      setDeleteConfirmRoom(null);
    } catch (err: any) {
      alert('Error deleting room: ' + err.message);
    }
  };

  const filteredRooms = (rooms || []).filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (locationFilter !== 'all' && r.location !== locationFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.hotelName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<Room>[] = [
    {
      header: 'Room & Hotel',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img
            src={r.images[0]}
            alt={r.title}
            className="w-14 h-11 rounded-lg object-cover border border-outline-variant/60 shrink-0"
          />
          <div>
            <p className="font-bold text-on-surface">{r.title}</p>
            <p className="text-xs text-primary font-semibold flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {r.hotelName} ({r.location})
            </p>
            <p className="text-[11px] text-on-surface-variant">#{r.roomNumber} • Floor {r.floor}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type & Location',
      cell: (r) => (
        <div>
          <span className="text-xs font-semibold text-on-surface block">{r.type}</span>
          <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-primary" /> {r.location}
          </span>
        </div>
      ),
    },
    {
      header: 'Capacity & Size',
      cell: (r) => (
        <span className="text-xs text-on-surface">
          {r.capacity} Guests • {r.sizeSqFt} sq ft
        </span>
      ),
    },
    {
      header: 'Nightly Rate',
      cell: (r) => (
        <span className="font-bold text-on-surface">{formatCurrency(r.pricePerNight)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="p-1.5 h-8 w-8"
            onClick={() => handleOpenEdit(r)}
            title="Edit Room"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-1.5 h-8 w-8 text-error hover:bg-error-container/40"
            onClick={() => setDeleteConfirmRoom(r)}
            title="Delete Room"
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
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Room Inventory & Locations</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Create, update pricing, assign hotel locations, and manage real-time suite occupancy.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Add New Room
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search room, hotel, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-semibold text-on-surface focus:outline-none"
        >
          <option value="all">All Locations</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Visakhapatnam">Visakhapatnam</option>
          <option value="Vijayawada">Vijayawada</option>
          <option value="Chennai">Chennai</option>
          <option value="Bengaluru">Bengaluru</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-semibold text-on-surface focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="Available">Available Only</option>
          <option value="Occupied">Occupied Only</option>
          <option value="Maintenance">Under Maintenance</option>
          <option value="Reserved">Reserved</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-semibold text-on-surface focus:outline-none"
        >
          <option value="all">All Room Types</option>
          <option value="Deluxe Suite">Deluxe Suite</option>
          <option value="Executive Suite">Executive Suite</option>
          <option value="Ocean Villa">Ocean Villa</option>
          <option value="Presidential Suite">Presidential Suite</option>
          <option value="Standard Room">Standard Room</option>
        </select>
      </div>

      {/* Table */}
      <Table
        data={filteredRooms}
        columns={columns}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No rooms found matching filters."
      />

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? `Edit Room #${formData.roomNumber}` : 'Create New Room Suite'}
        description="Enter accommodation specifications, location, rates, and amenities."
        size="xl"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room Title / Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Room Number"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hotel Property Name"
              value={formData.hotelName}
              onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
              required
            />
            <Select
              label="City Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            >
              <option value="Hyderabad">Hyderabad</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Accommodation Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="Deluxe Suite">Deluxe Suite</option>
              <option value="Executive Suite">Executive Suite</option>
              <option value="Ocean Villa">Ocean Villa</option>
              <option value="Presidential Suite">Presidential Suite</option>
              <option value="Standard Room">Standard Room</option>
            </Select>

            <Input
              label="Nightly Rate ($ USD)"
              type="number"
              min="50"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reserved">Reserved</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Max Capacity (Guests)"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              required
            />
            <Input
              label="Floor Level"
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              required
            />
            <Input
              label="Size (Square Feet)"
              type="number"
              value={formData.sizeSqFt}
              onChange={(e) => setFormData({ ...formData, sizeSqFt: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Bedding Configuration"
            value={formData.bedType}
            onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          <Input
            label="Primary Image URL"
            value={formData.images[0] || ''}
            onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createRoomMutation.isPending || updateRoomMutation.isPending}
            >
              {editingRoom ? 'Update Suite' : 'Create Suite'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmRoom}
        onClose={() => setDeleteConfirmRoom(null)}
        title="Delete Room Confirmation"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface">
            Are you sure you want to remove <strong>{deleteConfirmRoom?.title} (Room #{deleteConfirmRoom?.roomNumber})</strong> from the hotel inventory?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/40">
            <Button variant="outline" onClick={() => setDeleteConfirmRoom(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteRoomMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete Room
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
