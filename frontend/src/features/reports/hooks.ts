import { useQuery } from '@tanstack/react-query';
import { reportsApi } from './api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsApi.getDashboardStats(),
  });
};

export const useRevenueReport = () => {
  return useQuery({
    queryKey: ['revenue-report'],
    queryFn: () => reportsApi.getRevenueData(),
  });
};

export const useOccupancyReport = () => {
  return useQuery({
    queryKey: ['occupancy-report'],
    queryFn: () => reportsApi.getOccupancyData(),
  });
};

export const useBookingSources = () => {
  return useQuery({
    queryKey: ['booking-sources'],
    queryFn: () => reportsApi.getBookingSources(),
  });
};
