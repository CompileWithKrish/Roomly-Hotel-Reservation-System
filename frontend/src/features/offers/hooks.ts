import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi, OfferFilters, CreateOfferInput, UpdateOfferInput } from './api';
import { ValidateOfferRequest } from '../../types';

export const useActiveOffers = (bookingAmount?: number) => {
  return useQuery({
    queryKey: ['active-offers', bookingAmount],
    queryFn: () => offersApi.getActiveOffers(bookingAmount),
  });
};

export const useOffer = (id?: string) => {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => (id ? offersApi.getOfferById(id) : undefined),
    enabled: !!id,
  });
};

export const useAdminOffers = (filters?: OfferFilters) => {
  return useQuery({
    queryKey: ['admin-offers', filters],
    queryFn: () => offersApi.getAdminOffers(filters),
  });
};

export const useOfferStats = () => {
  return useQuery({
    queryKey: ['admin-offer-stats'],
    queryFn: () => offersApi.getOfferStats(),
  });
};

export const useValidateOffer = () => {
  return useMutation({
    mutationFn: (payload: ValidateOfferRequest) => offersApi.validateOffer(payload),
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOfferInput) => offersApi.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-offer-stats'] });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferInput }) =>
      offersApi.updateOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-offer-stats'] });
    },
  });
};

export const useToggleOfferStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      offersApi.toggleOfferStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-offer-stats'] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['active-offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-offer-stats'] });
    },
  });
};
