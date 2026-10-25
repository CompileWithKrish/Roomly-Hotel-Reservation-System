export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export type RoomType = 'Deluxe Suite' | 'Executive Suite' | 'Ocean Villa' | 'Standard Room' | 'Penthouse' | 'Presidential Suite';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Room {
  id: string;
  title: string;
  roomNumber: string;
  hotelName: string;
  location: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  sizeSqFt: number;
  floor: number;
  status: RoomStatus;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  featured?: boolean;
}

export type BookingStatus = 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'Pending';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  roomTitle: string;
  hotelName?: string;
  location?: string;
  roomType: RoomType;
  roomImage: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  baseRate: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  specialRequests?: string;
  offerId?: string;
  offerCode?: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Offer {
  id: string;
  code: string;
  title: string;
  bankName: string;
  cardNetwork: string;
  cardType: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount: number;
  startDateTime: string;
  expiryDateTime: string;
  maxTotalRedemptions: number;
  currentRedemptions: number;
  maxPerCustomerRedemptions: number;
  termsAndConditions?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentlyValid?: boolean;
}

export interface ValidateOfferRequest {
  offerId?: string;
  offerCode?: string;
  bookingAmount: number;
  customerEmail?: string;
  cardNetwork?: string;
  cardType?: string;
}

export interface OfferDiscountResponse {
  isValid: boolean;
  message: string;
  offerId?: string;
  offerCode?: string;
  offerTitle?: string;
  bankName?: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface OfferStats {
  activeOffers: number;
  totalOffers: number;
  totalRedemptions: number;
  totalDiscountGranted: number;
}

export type GuestTier = 'VIP' | 'Gold' | 'Silver' | 'Regular';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportId: string;
  tier: GuestTier;
  totalStays: number;
  totalSpent: number;
  lastStay: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  notes?: string;
  preferences?: string[];
  createdAt: string;
}

export interface DashboardStats {
  occupancyRate: number;
  occupancyDelta: number;
  totalRevenue: number;
  revenueDelta: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  activeGuests: number;
  availableRooms: number;
  totalRooms: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  bookings: number;
  target: number;
}

export interface OccupancyDataPoint {
  roomType: string;
  occupied: number;
  available: number;
  rate: number;
}

export interface BookingSourceData {
  name: string;
  value: number;
  color: string;
}
