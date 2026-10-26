import { Booking, BookingStatus, PaymentStatus, RoomType } from '../../types';
import { INITIAL_BOOKINGS } from '../../lib/mockData';
import { apiClient } from '../../lib/apiClient';

const BOOKINGS_STORAGE_KEY = 'roomly_bookings_data';

export const getStoredBookings = (): Booking[] => {
  const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_BOOKINGS;
    }
  }
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
};

export const saveStoredBookings = (bookings: Booking[]) => {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
};

export interface BookingFilters {
  status?: string;
  guestEmail?: string;
  search?: string;
}

const mapBackendToFrontendBooking = (dto: any): Booking => {
  const checkIn = dto.checkInDate || dto.checkIn || '2026-10-15';
  const checkOut = dto.checkOutDate || dto.checkOut || '2026-10-19';

  return {
    id: dto.id?.toString() || `bk-${Date.now()}`,
    bookingCode: dto.bookingNumber || dto.bookingCode || `ROOMLY-${Math.floor(10000 + Math.random() * 90000)}`,
    roomId: dto.roomId?.toString() || '',
    roomTitle: dto.roomName || dto.roomTitle || 'Luxury Suite',
    hotelName: dto.hotelName || 'Roomly Grand Banjara',
    location: dto.location || 'Hyderabad',
    roomType: (dto.roomType as RoomType) || 'Deluxe Suite',
    roomImage: dto.roomImage || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    guestId: dto.userId?.toString() || 'gst-01',
    guestName: dto.guestName || '',
    guestEmail: dto.guestEmail || '',
    guestPhone: dto.guestPhone || '',
    checkIn,
    checkOut,
    nights: dto.nights || 1,
    guestsCount: dto.guestsCount || 2,
    baseRate: typeof dto.roomPrice === 'number' ? dto.roomPrice : (typeof dto.baseRate === 'number' ? dto.baseRate : 350),
    taxes: typeof dto.taxAmount === 'number' ? dto.taxAmount : (typeof dto.taxes === 'number' ? dto.taxes : 42),
    serviceFee: typeof dto.serviceFee === 'number' ? dto.serviceFee : 45,
    discount: typeof dto.discount === 'number' ? dto.discount : 0,
    totalAmount: typeof dto.totalAmount === 'number' ? dto.totalAmount : 437,
    status: (dto.status as BookingStatus) || 'Confirmed',
    paymentStatus: (dto.paymentStatus as PaymentStatus) || 'Pending',
    paymentMethod: dto.paymentMethod || 'Pay at Hotel (Demo)',
    createdAt: dto.createdAt ? dto.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    specialRequests: dto.specialRequests || '',
  };
};

export const bookingsApi = {
  getBookings: async (filters?: BookingFilters): Promise<Booking[]> => {
    try {
      if (filters?.guestEmail) {
        const myData = await apiClient.get<any[]>('/bookings/my-bookings');
        if (Array.isArray(myData)) {
          const mapped = myData.map(mapBackendToFrontendBooking);
          return mapped;
        }
      }

      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      params.append('size', '50');

      const data = await apiClient.get<any>(`/bookings?${params.toString()}`);
      if (data?.content && Array.isArray(data.content)) {
        const mapped = data.content.map(mapBackendToFrontendBooking);
        saveStoredBookings(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Backend unavailable or restricted for admin bookings, attempting my-bookings fallback:', err);
      try {
        const myData = await apiClient.get<any[]>('/bookings/my-bookings');
        if (Array.isArray(myData)) {
          const mapped = myData.map(mapBackendToFrontendBooking);
          return mapped;
        }
      } catch {
        // Fall back to stored bookings
      }
    }

    let bookings = getStoredBookings();
    if (filters?.guestEmail) {
      bookings = bookings.filter((b) => b.guestEmail.toLowerCase() === filters.guestEmail?.toLowerCase());
    }
    if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
      bookings = bookings.filter((b) => b.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.guestName.toLowerCase().includes(q) ||
          b.roomTitle.toLowerCase().includes(q)
      );
    }
    return bookings;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const data = await apiClient.get<any[]>('/bookings/my-bookings');
      if (Array.isArray(data)) {
        return data.map(mapBackendToFrontendBooking);
      }
      return [];
    } catch (err: any) {
      console.error('Backend getMyBookings failed:', err);
      throw err;
    }
  },

  getBookingById: async (id: string): Promise<Booking | undefined> => {
    try {
      const data = await apiClient.get<any>(`/bookings/${id}`);
      if (data && data.id) {
        return mapBackendToFrontendBooking(data);
      }
    } catch (err) {
      // Fallback
    }
    const bookings = getStoredBookings();
    return bookings.find((b) => b.id === id || b.bookingCode === id);
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>): Promise<Booking> => {
    try {
      const payload = {
        roomId: bookingData.roomId,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod || 'Pay at Hotel (Demo)',
        offerId: bookingData.offerId,
        offerCode: bookingData.offerCode,
      };

      const res = await apiClient.post<any>('/bookings', payload);
      if (res && (res.id || res.bookingNumber || res.bookingCode)) {
        const created = mapBackendToFrontendBooking(res);
        const bookings = getStoredBookings();
        bookings.unshift(created);
        saveStoredBookings(bookings);
        return created;
      }
      throw new Error('Invalid response received from booking server.');
    } catch (err: any) {
      console.error('Backend createBooking failed:', err);
      const message = err.message || (typeof err.data?.message === 'string' ? err.data.message : 'Error processing reservation. Please verify your selected dates.');
      throw new Error(message);
    }
  },

  updateBookingStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
    const res = await apiClient.patch<any>(`/bookings/${id}/status`, { status });
    const updated = mapBackendToFrontendBooking(res);
    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id === id || b.bookingCode === id);
    if (index !== -1) {
      bookings[index] = updated;
      saveStoredBookings(bookings);
    }
    return updated;
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const res = await apiClient.post<any>(`/bookings/${id}/cancel`);
    return mapBackendToFrontendBooking(res);
  },
};
