import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestsApi, GuestFilters } from './api';
import { Guest } from '../../types';

export const useGuests = (filters?: GuestFilters) => {
  return useQuery({
    queryKey: ['guests', filters],
    queryFn: () => guestsApi.getGuests(filters),
  });
};

export const useGuest = (id?: string) => {
  return useQuery({
    queryKey: ['guest', id],
    queryFn: () => (id ? guestsApi.getGuestById(id) : undefined),
    enabled: !!id,
  });
};

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Guest, 'id' | 'createdAt' | 'totalStays' | 'totalSpent' | 'lastStay'>) =>
      guestsApi.createGuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
};

export const useUpdateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Guest> }) =>
      guestsApi.updateGuest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest'] });
    },
  });
};

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestsApi.deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
};
