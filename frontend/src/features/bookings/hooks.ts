import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, BookingFilters } from './api';
import { Booking, BookingStatus } from '../../types';

export const useBookings = (filters?: BookingFilters) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingsApi.getBookings(filters),
  });
};

export const useBooking = (id?: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => (id ? bookingsApi.getBookingById(id) : undefined),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) =>
      bookingsApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingsApi.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
