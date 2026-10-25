import { Room, RoomType, RoomStatus } from '../../types';
import { INITIAL_ROOMS } from '../../lib/mockData';
import { apiClient } from '../../lib/apiClient';

const ROOMS_STORAGE_KEY = 'roomly_rooms_data_v2';

export const getStoredRooms = (): Room[] => {
  const saved = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_ROOMS;
    }
  }
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
  return INITIAL_ROOMS;
};

export const saveStoredRooms = (rooms: Room[]) => {
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
};

export interface RoomFilters {
  location?: string;
  type?: string;
  status?: RoomStatus;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  search?: string;
}

const mapBackendToFrontendRoom = (dto: any): Room => {
  return {
    id: dto.id?.toString() || `room-${Date.now()}`,
    title: dto.name || dto.title || 'Luxury Suite',
    roomNumber: dto.roomNumber || '',
    hotelName: dto.hotelName || 'Roomly Grand Banjara',
    location: dto.location || 'Hyderabad',
    type: (dto.type as RoomType) || 'Deluxe Suite',
    description: dto.description || '',
    pricePerNight: typeof dto.pricePerNight === 'number' ? dto.pricePerNight : parseFloat(dto.pricePerNight || '350'),
    capacity: dto.capacity || 2,
    bedType: dto.bedType || '1 King Bed',
    sizeSqFt: dto.sizeSqft || dto.size || 500,
    floor: dto.floor || 1,
    status: (dto.status as RoomStatus) || 'Available',
    rating: typeof dto.rating === 'number' ? dto.rating : parseFloat(dto.rating || '5.0'),
    reviewCount: dto.reviewCount || 0,
    images: dto.images && dto.images.length > 0 ? dto.images : [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: dto.amenities || ['High-Speed Wi-Fi 6', 'Panoramic City View'],
    featured: dto.featured ?? true,
  };
};

export const roomsApi = {
  getRooms: async (filters?: RoomFilters): Promise<Room[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.location && filters.location !== 'All Locations' && filters.location !== 'all') {
        params.append('location', filters.location);
      }
      if (filters?.type && filters.type !== 'All Types' && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.status && filters.status !== ('all' as any)) {
        params.append('status', filters.status);
      }
      if (filters?.capacity) params.append('capacity', filters.capacity.toString());
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      params.append('size', '50');

      const data = await apiClient.get<any>(`/rooms?${params.toString()}`);
      if (data?.content && Array.isArray(data.content)) {
        const mapped = data.content.map(mapBackendToFrontendRoom);
        saveStoredRooms(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Backend unavailable or error fetching rooms, falling back to cached data:', err);
    }

    // Local Fallback
    let rooms = getStoredRooms();
    if (filters?.location && filters.location !== 'All Locations' && filters.location !== 'all' && filters.location.trim()) {
      const loc = filters.location.trim().toLowerCase();
      rooms = rooms.filter(
        (r) =>
          r.location.toLowerCase().includes(loc) ||
          r.hotelName.toLowerCase().includes(loc)
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      rooms = rooms.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.roomNumber.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.hotelName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    if (filters?.type && filters.type !== 'All Types' && filters.type !== 'all') {
      rooms = rooms.filter((r) => r.type === filters.type);
    }
    if (filters?.status && filters.status !== ('all' as any)) {
      rooms = rooms.filter((r) => r.status === filters.status);
    }
    if (filters?.minPrice !== undefined) {
      rooms = rooms.filter((r) => r.pricePerNight >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      rooms = rooms.filter((r) => r.pricePerNight <= filters.maxPrice!);
    }
    if (filters?.capacity !== undefined && filters.capacity > 0) {
      rooms = rooms.filter((r) => r.capacity >= filters.capacity!);
    }
    return rooms;
  },

  getRoomById: async (id: string): Promise<Room | undefined> => {
    try {
      const data = await apiClient.get<any>(`/rooms/${id}`);
      if (data && data.id) {
        return mapBackendToFrontendRoom(data);
      }
    } catch (err) {
      // Fallback
    }
    const rooms = getStoredRooms();
    return rooms.find((r) => r.id === id || r.roomNumber === id);
  },

  createRoom: async (roomData: Omit<Room, 'id' | 'rating' | 'reviewCount'>): Promise<Room> => {
    try {
      const payload = {
        roomNumber: roomData.roomNumber,
        name: roomData.title,
        hotelName: roomData.hotelName,
        location: roomData.location,
        type: roomData.type,
        status: roomData.status,
        pricePerNight: roomData.pricePerNight,
        capacity: roomData.capacity,
        sizeSqft: roomData.sizeSqFt,
        description: roomData.description,
        bedType: roomData.bedType,
        amenities: roomData.amenities,
        images: roomData.images,
      };
      const res = await apiClient.post<any>('/rooms', payload);
      if (res && res.id) {
        const created = mapBackendToFrontendRoom(res);
        const rooms = getStoredRooms();
        rooms.unshift(created);
        saveStoredRooms(rooms);
        return created;
      }
    } catch (err) {
      console.warn('Backend createRoom failed, falling back locally:', err);
    }

    const rooms = getStoredRooms();
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      images: roomData.images.length > 0 ? roomData.images : [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      ],
    };
    rooms.unshift(newRoom);
    saveStoredRooms(rooms);
    return newRoom;
  },

  updateRoom: async (id: string, updates: Partial<Room>): Promise<Room> => {
    try {
      const payload: any = {};
      if (updates.roomNumber) payload.roomNumber = updates.roomNumber;
      if (updates.title) payload.name = updates.title;
      if (updates.hotelName) payload.hotelName = updates.hotelName;
      if (updates.location) payload.location = updates.location;
      if (updates.type) payload.type = updates.type;
      if (updates.status) payload.status = updates.status;
      if (updates.pricePerNight !== undefined) payload.pricePerNight = updates.pricePerNight;
      if (updates.capacity !== undefined) payload.capacity = updates.capacity;
      if (updates.sizeSqFt !== undefined) payload.sizeSqft = updates.sizeSqFt;
      if (updates.description) payload.description = updates.description;
      if (updates.bedType) payload.bedType = updates.bedType;
      if (updates.amenities) payload.amenities = updates.amenities;
      if (updates.images) payload.images = updates.images;

      const res = await apiClient.put<any>(`/rooms/${id}`, payload);
      if (res && res.id) {
        const updated = mapBackendToFrontendRoom(res);
        const rooms = getStoredRooms();
        const index = rooms.findIndex((r) => r.id === id);
        if (index !== -1) {
          rooms[index] = updated;
          saveStoredRooms(rooms);
        }
        return updated;
      }
    } catch (err) {
      console.warn('Backend updateRoom failed, falling back locally:', err);
    }

    const rooms = getStoredRooms();
    const index = rooms.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Room not found');
    const updated = { ...rooms[index], ...updates };
    rooms[index] = updated;
    saveStoredRooms(rooms);
    return updated;
  },

  deleteRoom: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/rooms/${id}`);
    } catch (err) {
      console.warn('Backend deleteRoom failed, deleting locally:', err);
    }
    const rooms = getStoredRooms().filter((r) => r.id !== id);
    saveStoredRooms(rooms);
  },
};
