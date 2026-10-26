import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRoom } from '../../features/rooms/hooks';
import { useCreateBooking } from '../../features/bookings/hooks';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, calculateNights, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal } from '../../components/ui/Modal';
import { useActiveOffers, useValidateOffer } from '../../features/offers/hooks';
import { Offer } from '../../types';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Tag,
  Building2,
  Percent,
  Info,
  X,
} from 'lucide-react';

const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().min(2, 'Last name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().min(7, 'Valid phone is required'),
  country: z.string().trim().min(2, 'Country is required'),
  specialRequests: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  cardName: z.string().optional(),
  agreePolicies: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to cancellation & hotel policies' }),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const createBookingMutation = useCreateBooking();

  const roomId = searchParams.get('roomId') || 'room-101';
  const checkIn = searchParams.get('in') || '2026-10-15';
  const checkOut = searchParams.get('out') || '2026-10-19';
  const guests = parseInt(searchParams.get('guests') || '2', 10);

  const { data: room, isLoading } = useRoom(roomId);

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [successBookingCode, setSuccessBookingCode] = useState<string | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'card' | 'wallet' | 'arrival'>('arrival');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState<'hotel' | 'cancellation' | null>(null);

  // Credit Card Offer State & Hooks
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [offerValidationError, setOfferValidationError] = useState<string | null>(null);
  const [offerValidationMessage, setOfferValidationMessage] = useState<string | null>(null);
  const [termsModalOffer, setTermsModalOffer] = useState<Offer | null>(null);

  const nights = calculateNights(checkIn, checkOut);
  const baseRate = (room?.pricePerNight || 350) * nights;
  const taxes = Math.round(baseRate * 0.12);
  const serviceFee = 45;
  const subtotalBeforeDiscounts = baseRate + taxes + serviceFee;
  const totalAmount = Math.max(0, subtotalBeforeDiscounts - appliedDiscount);

  // Fetch active eligible offers for this booking subtotal
  const { data: availableOffers, isLoading: offersLoading } = useActiveOffers(subtotalBeforeDiscounts);
  const validateOfferMutation = useValidateOffer();

  const handleApplyCreditCardOffer = async (offer: Offer) => {
    setOfferValidationError(null);
    setOfferValidationMessage(null);

    try {
      const res = await validateOfferMutation.mutateAsync({
        offerId: offer.id,
        offerCode: offer.code,
        bookingAmount: subtotalBeforeDiscounts,
        customerEmail: user?.email || 'customer@roomly.com',
        cardNetwork: selectedPaymentType === 'card' ? 'Visa' : undefined,
      });

      if (res && res.isValid) {
        setSelectedOffer(offer);
        setAppliedDiscount(res.discountAmount);
        setOfferValidationMessage(res.message);
        setPromoCode('');
        setPromoMessage(null);
      } else {
        setOfferValidationError(res?.message || 'This offer cannot be applied to your booking.');
      }
    } catch (err: any) {
      setOfferValidationError(err.message || 'Error validating credit card offer.');
    }
  };

  const handleRemoveCreditCardOffer = () => {
    setSelectedOffer(null);
    setAppliedDiscount(0);
    setOfferValidationError(null);
    setOfferValidationMessage(null);
  };

  const {
    register,
    handleSubmit,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: user?.name ? user.name.split(' ')[0] : 'Sarah',
      lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : 'Jenkins',
      email: user?.email || 'customer@roomly.com',
      phone: user?.phone || '+1 (555) 987-6543',
      country: 'United States',
      specialRequests: 'High floor preferred. Arriving around 4:00 PM.',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      cardName: user?.name || 'Sarah Jenkins',
      agreePolicies: false as any,
    },
  });

  const agreePolicies = watch('agreePolicies');
  const { onChange: onAgreeChange, ...agreeRegister } = register('agreePolicies');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOffer) {
      alert('A credit card offer is already applied. Remove it first to use a promo code.');
      return;
    }
    if (promoCode.trim().toUpperCase() === 'ROOMLYVIP' || promoCode.trim().toUpperCase() === 'LUXURY100') {
      setAppliedDiscount(100);
      setPromoMessage('Promo code applied: $100 off your total stay!');
    } else {
      setPromoMessage('Invalid promo code. Try "ROOMLYVIP"');
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!room) {
      setBookingError('Unable to load suite details. Please return to suites list and choose a room.');
      return;
    }
    if (calculateNights(checkIn, checkOut) <= 0) {
      setBookingError('Check-out date must be strictly after check-in date.');
      return;
    }
    if (isProcessing || createBookingMutation.isPending) {
      return;
    }

    setIsProcessing(true);
    setBookingError(null);

    const paymentMethod =
      selectedPaymentType === 'card'
        ? `${selectedOffer ? selectedOffer.bankName : 'Credit Card'} (Pay at Hotel)`
        : selectedPaymentType === 'wallet'
        ? 'Digital Wallet (Pay at Hotel)'
        : 'Pay on Arrival (Front Desk)';

    try {
      const newBooking = await createBookingMutation.mutateAsync({
        roomId: room.id,
        roomTitle: room.title,
        roomType: room.type,
        roomImage: room.images[0],
        guestId: user?.id || 'gst-01',
        guestName: `${data.firstName} ${data.lastName}`.trim(),
        guestEmail: data.email.trim(),
        guestPhone: data.phone.trim(),
        checkIn,
        checkOut,
        nights,
        guestsCount: guests,
        baseRate,
        taxes,
        serviceFee,
        discount: appliedDiscount,
        totalAmount,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        paymentMethod,
        specialRequests: data.specialRequests,
        offerId: selectedOffer?.id,
        offerCode: selectedOffer?.code,
      });

      setSuccessBookingCode(newBooking.bookingCode);
    } catch (err: any) {
      setBookingError(err.message || 'Error processing reservation. Please verify your selected dates.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (successBookingCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">
            Reservation Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            We Look Forward to Welcoming You!
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            A confirmation receipt and concierge details have been dispatched to your email.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-md text-left space-y-3 max-w-lg mx-auto">
          <div className="flex justify-between items-center pb-3 border-b border-outline-variant/40">
            <span className="text-xs font-semibold text-on-surface-variant">Booking Reference</span>
            <span className="text-base font-black text-primary">{successBookingCode}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Suite Reserved</span>
            <span className="font-bold text-on-surface">{room?.title}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Stay Dates</span>
            <span className="font-bold text-on-surface">
              {formatDate(checkIn)} — {formatDate(checkOut)} ({nights} nights)
            </span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-on-surface-variant">Payment Status</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Confirmed — Payment Due at Hotel
            </span>
          </div>
          <div className="flex justify-between text-xs border-t border-outline-variant/40 pt-2">
            <span className="text-on-surface-variant font-medium">Total Balance (Pay at Hotel)</span>
            <span className="font-bold text-base text-primary">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Link to="/customer/dashboard">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View in My Bookings
            </Button>
          </Link>
          <Link to="/rooms">
            <Button size="lg" variant="outline">
              Back to Suites
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          Complete Your Reservation
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Review your luxury suite details, enter guest information & confirm booking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Form Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Guest Details Card */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Guest Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Sarah"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Last Name"
                  placeholder="Jenkins"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address (for confirmation)"
                  type="email"
                  placeholder="sarah@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Mobile Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <Input
                label="Country of Residence"
                placeholder="United States"
                error={errors.country?.message}
                {...register('country')}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g., High floor, dietary preferences, early check-in notes..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  {...register('specialRequests')}
                />
              </div>
            </div>

            {/* Step 2: Limited-Time Credit Card Offers */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                      Bank & Credit Card Offers
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Instant discounts applied directly at checkout on eligible cards
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                  <Tag className="w-3.5 h-3.5" /> Limited-Time Specials
                </div>
              </div>

              {/* Sandbox Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                  <p>
                    <strong>Demonstration Offers:</strong> The banking promotions listed below are simulated for sandbox demonstration. No real card charge will be made.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 shrink-0">
                  Sandbox
                </span>
              </div>

              {/* Active Applied Banner */}
              {selectedOffer && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900">
                        {selectedOffer.title} ({selectedOffer.code})
                      </p>
                      <p className="text-xs text-emerald-700 font-medium">
                        Instant savings of <strong>{formatCurrency(appliedDiscount)}</strong> applied to your reservation total!
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-emerald-400 text-emerald-800 hover:bg-emerald-100 font-bold"
                    onClick={handleRemoveCreditCardOffer}
                  >
                    Remove Offer
                  </Button>
                </div>
              )}

              {/* Validation Feedback Messages */}
              {offerValidationError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{offerValidationError}</span>
                </div>
              )}

              {/* Offers List */}
              <div className="space-y-3 pt-1">
                {offersLoading ? (
                  <div className="py-6 text-center text-xs text-on-surface-variant">
                    Checking available banking promotions...
                  </div>
                ) : !availableOffers || availableOffers.length === 0 ? (
                  <div className="p-6 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant">
                    No active credit card offers found for this booking.
                  </div>
                ) : (
                  availableOffers.map((offer) => {
                    const isApplied = selectedOffer?.id === offer.id;
                    const isEligibleAmount = subtotalBeforeDiscounts >= offer.minBookingAmount;

                    return (
                      <div
                        key={offer.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isApplied
                            ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                            : 'border-outline-variant/60 bg-surface-container-low/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary" /> {offer.bankName}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                                {offer.cardNetwork} ({offer.cardType})
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black">
                                {offer.discountType === 'PERCENTAGE'
                                  ? `${offer.discountValue}% OFF${offer.maxDiscount ? ` (Cap: ${formatCurrency(offer.maxDiscount)})` : ''}`
                                  : `Flat ${formatCurrency(offer.discountValue)} OFF`}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-on-surface">{offer.title}</h4>
                            <p className="text-xs text-on-surface-variant">{offer.description}</p>

                            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-on-surface-variant">
                              <span>
                                Min. Spend: <strong>{formatCurrency(offer.minBookingAmount)}</strong>
                              </span>
                              <span>
                                Valid until: <strong>{formatDate(offer.expiryDateTime)}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setTermsModalOffer(offer)}
                                className="text-primary font-bold hover:underline"
                              >
                                View T&C
                              </button>
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0">
                            {isApplied ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Applied
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant={isEligibleAmount ? 'primary' : 'outline'}
                                disabled={!isEligibleAmount || validateOfferMutation.isPending}
                                onClick={() => handleApplyCreditCardOffer(offer)}
                              >
                                {isEligibleAmount ? 'Apply Offer' : `Min. ${formatCurrency(offer.minBookingAmount)}`}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 3: Payment Method Card */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Payment Selection
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Pay at Hotel (Demo Mode)
                </div>
              </div>

              {/* Notice regarding demo payment flow */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <span>Payment Not Integrated Yet — Pay at Hotel</span>
                </div>
                <p>
                  Online payment gateway integration is currently in demo mode. No payment will be deducted today and real card details are not required. Your booking will be confirmed with payment due at hotel check-in.
                </p>
              </div>

              {bookingError && (
                <div className="p-4 rounded-xl bg-error-container/60 border border-error/30 text-on-error-container text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-error shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentType('arrival')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedPaymentType === 'arrival'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-outline-variant/60 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Recommended</span>
                  </div>
                  <span className="text-xs font-bold">Pay at Check-In</span>
                  <span className="text-[10px] text-on-surface-variant">Zero advance fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentType('card')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedPaymentType === 'card'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-outline-variant/60 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Terminal</span>
                  </div>
                  <span className="text-xs font-bold">Credit / Debit Card</span>
                  <span className="text-[10px] text-on-surface-variant">Pay on arrival</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentType('wallet')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedPaymentType === 'wallet'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-outline-variant/60 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Digital</span>
                  </div>
                  <span className="text-xs font-bold">Wallet / UPI</span>
                  <span className="text-[10px] text-on-surface-variant">Pay on arrival</span>
                </button>
              </div>

              {selectedPaymentType === 'card' && (
                <div className="space-y-3 pt-2 border-t border-outline-variant/40">
                  <p className="text-[11px] text-on-surface-variant italic">
                    Optional demo card preferences for hotel check-in settlement (no charge processed):
                  </p>
                  <Input
                    label="Cardholder Name (Optional)"
                    placeholder="Sarah Jenkins"
                    {...register('cardName')}
                  />
                  <Input
                    label="Card Number (Optional)"
                    placeholder="4242 •••• •••• 4242"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    {...register('cardNumber')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiration Date (Optional)"
                      placeholder="MM/YY"
                      {...register('cardExpiry')}
                    />
                    <Input
                      label="Security CVC (Optional)"
                      placeholder="123"
                      {...register('cardCvc')}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Checkbox
                  id="agree-policies"
                  label={
                    <span className="text-xs text-on-surface-variant leading-relaxed">
                      I have reviewed and agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPolicyModal('hotel');
                        }}
                        className="text-primary font-semibold underline hover:text-primary-dim inline cursor-pointer"
                      >
                        Hotel Stay Policies
                      </button>
                      ,{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPolicyModal('cancellation');
                        }}
                        className="text-primary font-semibold underline hover:text-primary-dim inline cursor-pointer"
                      >
                        Cancellation Terms
                      </button>
                      , and acknowledge that the booking will be confirmed with payment due at hotel check-in.
                    </span>
                  }
                  checked={!!agreePolicies}
                  error={errors.agreePolicies?.message}
                  {...agreeRegister}
                  onChange={(e) => {
                    onAgreeChange(e);
                    if (e.target.checked) {
                      clearErrors('agreePolicies');
                    }
                  }}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Sticky Booking Summary */}
        <div>
          <div className="sticky top-24 bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/60 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-on-surface pb-3 border-b border-outline-variant/40">
              Reservation Overview
            </h3>

            {/* Room mini card */}
            <div className="flex gap-3 items-center">
              <img
                src={room?.images[0]}
                alt={room?.title}
                className="w-20 h-20 rounded-xl object-cover border border-outline-variant/50 shrink-0 shadow-sm"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {room?.type}
                </span>
                <h4 className="text-sm font-bold text-on-surface leading-snug">{room?.title}</h4>
                <p className="text-xs text-on-surface-variant">Floor {room?.floor} • Room #{room?.roomNumber}</p>
              </div>
            </div>

            {/* Stay details */}
            <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Dates
                </span>
                <span className="font-bold text-on-surface">
                  {formatDate(checkIn)} — {formatDate(checkOut)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-primary" /> Guests & Duration
                </span>
                <span className="font-bold text-on-surface">
                  {guests} Guests • {nights} Nights
                </span>
              </div>
            </div>

            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code (e.g. ROOMLYVIP)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary uppercase"
              />
              <Button type="submit" size="sm" variant="outline">
                Apply
              </Button>
            </form>
            {promoMessage && (
              <p
                className={`text-xs font-semibold ${
                  appliedDiscount > 0 ? 'text-emerald-700' : 'text-error'
                }`}
              >
                {promoMessage}
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-on-surface-variant border-t border-outline-variant/40 pt-4">
              <div className="flex justify-between">
                <span>{formatCurrency(room?.pricePerNight || 350)} × {nights} nights</span>
                <span className="font-semibold text-on-surface">{formatCurrency(baseRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Luxury Hospitality Surcharge (12%)</span>
                <span className="font-semibold text-on-surface">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort & Concierge Fee</span>
                <span className="font-semibold text-on-surface">{formatCurrency(serviceFee)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {selectedOffer ? `${selectedOffer.bankName} (${selectedOffer.code})` : 'Promo Code Discount'}
                  </span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}
              <div className="border-t border-outline-variant/60 pt-3 flex justify-between text-base font-bold text-on-surface">
                <span>Total Amount</span>
                <span className="text-xl text-primary font-black">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              variant="primary"
              className="w-full py-4 text-base font-bold shadow-xl cursor-pointer"
              disabled={isSubmitting || createBookingMutation.isPending || isProcessing}
              isLoading={isSubmitting || createBookingMutation.isPending || isProcessing}
            >
              {createBookingMutation.isPending || isProcessing ? 'Confirming Reservation...' : 'Confirm & Book Suite'}
            </Button>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={!!termsModalOffer}
        onClose={() => setTermsModalOffer(null)}
        title={termsModalOffer ? `${termsModalOffer.bankName} — Terms & Conditions` : 'Terms & Conditions'}
        description={termsModalOffer?.title}
      >
        {termsModalOffer && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Offer Code:</span>
                <span className="font-bold text-primary">{termsModalOffer.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Card Network / Type:</span>
                <span className="font-bold text-on-surface">{termsModalOffer.cardNetwork} ({termsModalOffer.cardType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Minimum Spend:</span>
                <span className="font-bold text-on-surface">{formatCurrency(termsModalOffer.minBookingAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Validity Window:</span>
                <span className="font-bold text-on-surface">{formatDate(termsModalOffer.startDateTime)} — {formatDate(termsModalOffer.expiryDateTime)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-on-surface mb-1">Official Promotional Terms</h4>
              <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">
                {termsModalOffer.termsAndConditions || 'Standard hotel reservation terms apply. Minimum booking duration of 1 night required.'}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/40">
              <Button variant="primary" onClick={() => setTermsModalOffer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Hotel Policies & Cancellation Modal */}
      <Modal
        isOpen={!!showPolicyModal}
        onClose={() => setShowPolicyModal(null)}
        title={showPolicyModal === 'hotel' ? 'Hotel Stay Policies' : 'Cancellation Terms'}
        description="Roomly Luxury Hospitality Guest Guidelines"
      >
        <div className="space-y-4 text-xs text-on-surface-variant leading-relaxed">
          {showPolicyModal === 'hotel' ? (
            <>
              <p><strong>Check-In & Check-Out:</strong> Check-in is available from 3:00 PM onwards. Check-out time is 11:00 AM. Early arrivals and late departures are accommodated upon request subject to suite availability.</p>
              <p><strong>Guest Identification:</strong> A government-issued photo ID is required from the primary guest at the reception desk upon check-in.</p>
              <p><strong>Demo Booking Guarantee:</strong> No advance payment or deposit is charged today. Room charges and incidental expenses will be settled at the hotel front desk.</p>
              <p><strong>Property Etiquette:</strong> All suites are strictly non-smoking. Quiet luxury hours are maintained between 10:00 PM and 7:00 AM.</p>
            </>
          ) : (
            <>
              <p><strong>Free Cancellation Window:</strong> Reservations can be cancelled free of charge up to 24 hours prior to scheduled check-in via your My Bookings dashboard.</p>
              <p><strong>Modification Flexibility:</strong> Stay dates, guest headcounts, and special requests can be updated anytime before arrival at zero penalty fee.</p>
              <p><strong>Zero Advance Risk:</strong> Since payment is collected at the hotel upon check-in, no refund processing wait or deductions will occur if you cancel.</p>
            </>
          )}
          <div className="flex justify-end pt-3 border-t border-outline-variant/40">
            <Button variant="primary" size="sm" onClick={() => setShowPolicyModal(null)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
