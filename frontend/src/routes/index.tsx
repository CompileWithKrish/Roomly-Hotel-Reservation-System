import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { RoomsPage } from '../pages/public/RoomsPage';
import { RoomDetailsPage } from '../pages/public/RoomDetailsPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Customer Pages
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminRoomsPage } from '../pages/admin/AdminRoomsPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminGuestsPage } from '../pages/admin/AdminGuestsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminOffersPage } from '../pages/admin/AdminOffersPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/offers" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailsPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Customer Pages */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['customer', 'admin']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
        <Route path="/customer/bookings" element={<CustomerDashboardPage />} />
      </Route>

      {/* Admin Pages */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/rooms" element={<AdminRoomsPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/guests" element={<AdminGuestsPage />} />
        <Route path="/admin/offers" element={<AdminOffersPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
