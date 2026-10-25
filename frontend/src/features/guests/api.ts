import { Guest, GuestTier } from '../../types';
import { INITIAL_GUESTS } from '../../lib/mockData';
import { apiClient } from '../../lib/apiClient';

const GUESTS_STORAGE_KEY = 'roomly_guests_data';

export const getStoredGuests = (): Guest[] => {
  const saved = localStorage.getItem(GUESTS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_GUESTS;
    }
  }
  localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(INITIAL_GUESTS));
  return INITIAL_GUESTS;
};

export const saveStoredGuests = (guests: Guest[]) => {
  localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(guests));
};

export interface GuestFilters {
  tier?: string;
  status?: string;
  search?: string;
}

const mapBackendToFrontendGuest = (dto: any): Guest => {
  let firstName = dto.firstName || '';
  let lastName = dto.lastName || '';
  if (!firstName && dto.fullName) {
    const parts = dto.fullName.trim().split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }

  return {
    id: dto.id?.toString() || `gst-${Date.now()}`,
    firstName,
    lastName,
    email: dto.email || '',
    phone: dto.phone || '',
    nationality: dto.nationality || dto.country || 'United States',
    passportId: dto.passportId || dto.passportNumber || '',
    tier: (dto.tier as GuestTier) || 'Regular',
    totalStays: dto.totalStays || 0,
    totalSpent: typeof dto.totalSpent === 'number' ? dto.totalSpent : parseFloat(dto.totalSpent || '0'),
    lastStay: dto.lastStay || (dto.lastStayDate ? dto.lastStayDate.toString() : 'None'),
    status: dto.status === 'Inactive' ? 'Inactive' : 'Active',
    avatar: dto.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    notes: dto.notes || '',
    preferences: dto.preferences || ['Quiet Room'],
    createdAt: dto.createdAt ? dto.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
  };
};

export const guestsApi = {
  getGuests: async (filters?: GuestFilters): Promise<Guest[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.tier && filters.tier !== 'All' && filters.tier !== 'all') {
        params.append('tier', filters.tier);
      }
      if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      params.append('size', '50');

      const data = await apiClient.get<any>(`/guests?${params.toString()}`);
      if (data?.content && Array.isArray(data.content)) {
        const mapped = data.content.map(mapBackendToFrontendGuest);
        saveStoredGuests(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Backend unavailable or error fetching guests, falling back to cached data:', err);
    }

    let guests = getStoredGuests();
    if (filters?.tier && filters.tier !== 'All' && filters.tier !== 'all') {
      guests = guests.filter((g) => g.tier === filters.tier);
    }
    if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
      guests = guests.filter((g) => g.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      guests = guests.filter(
        (g) =>
          g.firstName.toLowerCase().includes(q) ||
          g.lastName.toLowerCase().includes(q) ||
          g.email.toLowerCase().includes(q) ||
          g.passportId.toLowerCase().includes(q) ||
          g.nationality.toLowerCase().includes(q)
      );
    }
    return guests;
  },

  getGuestById: async (id: string): Promise<Guest | undefined> => {
    try {
      const data = await apiClient.get<any>(`/guests/${id}`);
      if (data && data.id) {
        return mapBackendToFrontendGuest(data);
      }
    } catch (err) {
      // Fallback
    }
    const guests = getStoredGuests();
    return guests.find((g) => g.id === id);
  },

  createGuest: async (guestData: Omit<Guest, 'id' | 'createdAt' | 'totalStays' | 'totalSpent' | 'lastStay'>): Promise<Guest> => {
    try {
      const payload = {
        fullName: `${guestData.firstName} ${guestData.lastName}`.trim(),
        email: guestData.email,
        phone: guestData.phone,
        avatar: guestData.avatar,
        tier: guestData.tier,
        status: guestData.status,
        country: guestData.nationality,
        passportNumber: guestData.passportId,
        notes: guestData.notes,
        preferences: guestData.preferences,
      };

      const res = await apiClient.post<any>('/guests', payload);
      if (res && res.id) {
        const created = mapBackendToFrontendGuest(res);
        const guests = getStoredGuests();
        guests.unshift(created);
        saveStoredGuests(guests);
        return created;
      }
    } catch (err) {
      console.warn('Backend createGuest failed, saving locally:', err);
    }

    const guests = getStoredGuests();
    const newGuest: Guest = {
      ...guestData,
      id: `gst-${Date.now()}`,
      totalStays: 0,
      totalSpent: 0,
      lastStay: 'None',
      avatar: guestData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };
    guests.unshift(newGuest);
    saveStoredGuests(guests);
    return newGuest;
  },

  updateGuest: async (id: string, updates: Partial<Guest>): Promise<Guest> => {
    try {
      const payload: any = {};
      if (updates.firstName || updates.lastName) {
        payload.fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
      }
      if (updates.email) payload.email = updates.email;
      if (updates.phone) payload.phone = updates.phone;
      if (updates.avatar) payload.avatar = updates.avatar;
      if (updates.tier) payload.tier = updates.tier;
      if (updates.status) payload.status = updates.status;
      if (updates.nationality) payload.country = updates.nationality;
      if (updates.passportId) payload.passportNumber = updates.passportId;
      if (updates.notes) payload.notes = updates.notes;
      if (updates.preferences) payload.preferences = updates.preferences;

      const res = await apiClient.put<any>(`/guests/${id}`, payload);
      if (res && res.id) {
        const updated = mapBackendToFrontendGuest(res);
        const guests = getStoredGuests();
        const index = guests.findIndex((g) => g.id === id);
        if (index !== -1) {
          guests[index] = updated;
          saveStoredGuests(guests);
        }
        return updated;
      }
    } catch (err) {
      console.warn('Backend updateGuest failed, saving locally:', err);
    }

    const guests = getStoredGuests();
    const index = guests.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Guest not found');
    const updated = { ...guests[index], ...updates };
    guests[index] = updated;
    saveStoredGuests(guests);
    return updated;
  },

  deleteGuest: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/guests/${id}`);
    } catch (err) {
      console.warn('Backend deleteGuest failed, deleting locally:', err);
    }
    const guests = getStoredGuests().filter((g) => g.id !== id);
    saveStoredGuests(guests);
  },
};
