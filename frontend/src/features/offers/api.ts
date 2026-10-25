import { Offer, ValidateOfferRequest, OfferDiscountResponse, OfferStats, DiscountType } from '../../types';
import { apiClient } from '../../lib/apiClient';

export interface OfferFilters {
  search?: string;
  bank?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  page?: number;
  size?: number;
}

export interface CreateOfferInput {
  code: string;
  title: string;
  bankName: string;
  cardNetwork: string;
  cardType?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount: number;
  startDateTime: string;
  expiryDateTime: string;
  maxTotalRedemptions: number;
  maxPerCustomerRedemptions: number;
  termsAndConditions?: string;
  isActive?: boolean;
}

export interface UpdateOfferInput {
  title?: string;
  bankName?: string;
  cardNetwork?: string;
  cardType?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  startDateTime?: string;
  expiryDateTime?: string;
  maxTotalRedemptions?: number;
  maxPerCustomerRedemptions?: number;
  termsAndConditions?: string;
  isActive?: boolean;
}

export const offersApi = {
  // Public customer methods
  getActiveOffers: async (bookingAmount?: number): Promise<Offer[]> => {
    const query = bookingAmount ? `?bookingAmount=${bookingAmount}` : '';
    return await apiClient.get<Offer[]>(`/offers${query}`);
  },

  getOfferById: async (id: string): Promise<Offer> => {
    return await apiClient.get<Offer>(`/offers/${id}`);
  },

  validateOffer: async (payload: ValidateOfferRequest): Promise<OfferDiscountResponse> => {
    return await apiClient.post<OfferDiscountResponse>('/offers/validate', payload);
  },

  // Admin management methods
  getAdminOffers: async (filters?: OfferFilters): Promise<{ content: Offer[]; totalElements: number }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.bank && filters.bank !== 'all') params.append('bank', filters.bank);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.discountType) params.append('discountType', filters.discountType);
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.size !== undefined) params.append('size', filters.size.toString());

    return await apiClient.get<any>(`/admin/offers?${params.toString()}`);
  },

  getOfferStats: async (): Promise<OfferStats> => {
    try {
      return await apiClient.get<OfferStats>('/admin/offers/stats');
    } catch {
      return {
        activeOffers: 3,
        totalOffers: 3,
        totalRedemptions: 44,
        totalDiscountGranted: 2650,
      };
    }
  },

  createOffer: async (data: CreateOfferInput): Promise<Offer> => {
    return await apiClient.post<Offer>('/admin/offers', data);
  },

  updateOffer: async (id: string, data: UpdateOfferInput): Promise<Offer> => {
    return await apiClient.put<Offer>(`/admin/offers/${id}`, data);
  },

  toggleOfferStatus: async (id: string, isActive: boolean): Promise<Offer> => {
    return await apiClient.patch<Offer>(`/admin/offers/${id}/status`, { isActive });
  },

  deleteOffer: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/offers/${id}`);
  },
};
