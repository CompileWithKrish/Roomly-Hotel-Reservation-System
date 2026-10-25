import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi, RoomFilters } from './api';
import { Room } from '../../types';

export const useRooms = (filters?: RoomFilters) => {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => roomsApi.getRooms(filters),
  });
};

export const useRoom = (id?: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => (id ? roomsApi.getRoomById(id) : undefined),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, 'id' | 'rating' | 'reviewCount'>) => roomsApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Room> }) =>
      roomsApi.updateRoom(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room'] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
