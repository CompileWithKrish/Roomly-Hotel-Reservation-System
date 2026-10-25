import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Info,
  ChevronRight,
  Tag,
  Percent,
} from 'lucide-react';
import { useActiveOffers } from '../hooks';
import { Offer } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';

interface CreditCardOffersSectionProps {
  onSelectOfferForBooking?: (offer: Offer) => void;
  className?: string;
  isCompact?: boolean;
}

export const CreditCardOffersSection: React.FC<CreditCardOffersSectionProps> = ({
  onSelectOfferForBooking,
  className = '',
  isCompact = false,
}) => {
  const { data: offers, isLoading, isError, error, refetch } = useActiveOffers();
  const [selectedOfferForModal, setSelectedOfferForModal] = useState<Offer | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Helper to dynamically calculate remaining validity and offer status
  const getOfferValidityDetails = (offer: Offer) => {
    const now = new Date().getTime();
    const expiry = new Date(offer.expiryDateTime).getTime();
    const start = new Date(offer.startDateTime).getTime();
    const diffMs = expiry - now;

    if (!offer.isActive) {
      return {
        status: 'Inactive' as const,
        statusColor: 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300',
        remainingText: 'Inactive',
        isExpiringSoon: false,
        isExpired: true,
      };
    }

    if (diffMs <= 0 || now < start) {
      return {
        status: diffMs <= 0 ? ('Expired' as const) : ('Inactive' as const),
        statusColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400',
        remainingText: diffMs <= 0 ? 'Offer has expired' : 'Not yet started',
        isExpiringSoon: false,
        isExpired: true,
      };
    }

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffDays <= 7) {
      const remainingLabel = diffDays === 1 ? `${diffHours} hours remaining` : `${diffDays} days remaining`;
      return {
        status: 'Ending Soon' as const,
        statusColor: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
        remainingText: remainingLabel,
        isExpiringSoon: true,
        isExpired: false,
      };
    }

    return {
      status: 'Active' as const,
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
      remainingText: `${diffDays} days remaining`,
      isExpiringSoon: false,
      isExpired: false,
    };
  };

  // Unique bank names for filter
  const bankOptions = useMemo(() => {
    if (!offers) return ['all'];
    const banks = Array.from(new Set(offers.map((o) => o.bankName)));
    return ['all', ...banks];
  }, [offers]);

  // Filtered active customer offers: only show active, valid, non-expired offers to customers
  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    const now = Date.now();
    return offers.filter((o) => {
      const isExpired = new Date(o.expiryDateTime).getTime() <= now;
      if (!o.isActive || isExpired) {
        return false;
      }
      if (selectedBankFilter !== 'all' && o.bankName !== selectedBankFilter) {
        return false;
      }
      return true;
    });
  }, [offers, selectedBankFilter]);

  const handleBookNow = (offer: Offer) => {
    if (onSelectOfferForBooking) {
      onSelectOfferForBooking(offer);
    } else {
      // Smooth scroll to rooms section or navigate
      const roomsContainer = document.getElementById('rooms-listing-grid');
      if (roomsContainer) {
        roomsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="credit-card-offers-section" className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/50 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
            <CreditCard className="w-3.5 h-3.5" />
            <span>PARTNER PRIVILEGES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Limited-Time Credit Card Offers
          </h2>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Save more on your next stay with eligible card offers. Select a promotion below and apply your exclusive instant discount during checkout.
          </p>
        </div>

        {/* Bank Filter Chips */}
        {bankOptions.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {bankOptions.map((bank) => (
              <button
                key={bank}
                onClick={() => setSelectedBankFilter(bank)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedBankFilter === bank
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {bank === 'all' ? 'All Banks' : bank}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Sandbox & Demonstration Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold flex items-center gap-2">
            <span>Demonstration Offers Notice</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] uppercase font-black tracking-wider">
              Simulation Sandbox
            </span>
          </p>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            The banking promotions listed below (e.g., HDFC Bank, SBI Card, ICICI Bank) are demonstration offers for evaluation and sandbox booking workflows. Roomly is not directly sponsored by or affiliated with the mentioned banking institutions. Disclaimers and rules apply.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/60 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="w-24 h-5 rounded-md" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
              <Skeleton className="w-3/4 h-7 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-lg" />
              <div className="pt-2 border-t border-outline-variant/40 flex justify-between items-center">
                <Skeleton className="w-28 h-8 rounded-lg" />
                <Skeleton className="w-24 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">Unable to load card offers</h3>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
              {error instanceof Error ? error.message : 'Database or network connection failed while loading promotional offers.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mx-auto flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOffers.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant">
            <CreditCard className="w-7 h-7 text-primary/70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-on-surface">No active card offers currently available</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              {selectedBankFilter !== 'all'
                ? `There are no active offers for ${selectedBankFilter} at this moment. Try selecting "All Banks".`
                : 'Check back soon for new seasonal promotions and exclusive banking discount partnerships.'}
            </p>
          </div>
          {selectedBankFilter !== 'all' && (
            <Button variant="outline" size="sm" onClick={() => setSelectedBankFilter('all')}>
              Show All Offers
            </Button>
          )}
        </div>
      )}

      {/* Offers Cards Grid */}
      {!isLoading && !isError && filteredOffers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const validity = getOfferValidityDetails(offer);
            const isPercentage = offer.discountType === 'PERCENTAGE';

            return (
              <div
                key={offer.id}
                className="group relative bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Top Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary/60" />

                <div className="p-6 space-y-4">
                  {/* Bank & Network Badge Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          {offer.bankName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          Demo Offer
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-secondary" />
                        {offer.cardNetwork} • {offer.cardType}
                      </p>
                    </div>

                    {/* Dynamic Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${validity.statusColor} flex items-center gap-1 shrink-0`}
                    >
                      <Clock className="w-3 h-3" />
                      {validity.status}
                    </span>
                  </div>

                  {/* Discount Highlight & Title */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                        {isPercentage ? `${offer.discountValue}% OFF` : `Flat ${formatCurrency(offer.discountValue)} OFF`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {offer.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* Conditions & Criteria Box */}
                  <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/40 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Minimum Booking:</span>
                      <span className="font-bold text-on-surface">{formatCurrency(offer.minBookingAmount)}</span>
                    </div>
                    {offer.maxDiscount && (
                      <div className="flex justify-between items-center text-on-surface-variant">
                        <span>Max Savings Cap:</span>
                        <span className="font-bold text-primary">{formatCurrency(offer.maxDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Offer Expiry:</span>
                      <span className="font-semibold text-on-surface">{formatDate(offer.expiryDateTime)}</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant pt-1 border-t border-outline-variant/30 text-[11px]">
                      <span>Remaining Validity:</span>
                      <span className={`font-semibold ${validity.isExpiringSoon ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {validity.remainingText}
                      </span>
                    </div>
                  </div>

                  {/* Short Terms & Conditions */}
                  {offer.termsAndConditions && (
                    <div className="p-2.5 rounded-lg bg-surface-container text-[11px] text-on-surface-variant/90 border border-outline-variant/30 line-clamp-2">
                      <span className="font-semibold text-on-surface">T&C: </span>
                      {offer.termsAndConditions}
                    </div>
                  )}

                  {/* Promo Code Pill with Copy */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-dashed border-outline-variant">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-mono font-bold tracking-wider text-on-surface">
                        {offer.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(offer.code, e)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-surface-container-lowest hover:bg-surface-container-high text-on-surface transition-colors shadow-2xs"
                      title="Copy promo code"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-on-surface-variant" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-6 pt-0 border-t border-outline-variant/40 mt-3 pt-4 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOfferForModal(offer)}
                    className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                  >
                    View Offer
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBookNow(offer)}
                      className="text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Terms & Conditions Modal */}
      {selectedOfferForModal && (
        <Modal
          isOpen={!!selectedOfferForModal}
          onClose={() => setSelectedOfferForModal(null)}
          title={selectedOfferForModal.title}
          size="lg"
        >
          <div className="space-y-6">
            {/* Offer Banner in Modal */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border border-outline-variant flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {selectedOfferForModal.bankName}
                </span>
                <p className="text-2xl font-black text-on-surface">
                  {selectedOfferForModal.discountType === 'PERCENTAGE'
                    ? `${selectedOfferForModal.discountValue}% Instant Discount`
                    : `Flat ${formatCurrency(selectedOfferForModal.discountValue)} Discount`}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Network: {selectedOfferForModal.cardNetwork} ({selectedOfferForModal.cardType})
                </p>
              </div>

              <div className="text-right space-y-1.5">
                <div className="inline-block px-3 py-1.5 rounded-xl bg-surface-container font-mono font-bold text-sm tracking-wider text-on-surface border border-outline-variant">
                  {selectedOfferForModal.code}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedOfferForModal.code)}
                  className="block text-xs font-semibold text-primary hover:underline ml-auto"
                >
                  {copiedCode === selectedOfferForModal.code ? 'Copied to clipboard!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Offer Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <span className="text-on-surface-variant block mb-1">Minimum Booking</span>
                <span className="text-sm font-bold text-on-surface">
                  {formatCurrency(selectedOfferForModal.minBookingAmount)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <span className="text-on-surface-variant block mb-1">Savings Cap</span>
                <span className="text-sm font-bold text-primary">
                  {selectedOfferForModal.maxDiscount ? formatCurrency(selectedOfferForModal.maxDiscount) : 'No Cap'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <span className="text-on-surface-variant block mb-1">Valid Until</span>
                <span className="text-sm font-bold text-on-surface">
                  {formatDate(selectedOfferForModal.expiryDateTime)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <span className="text-on-surface-variant block mb-1">Status</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Active & Valid
                </span>
              </div>
            </div>

            {/* Full Terms and Conditions text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                Terms and Conditions
              </h4>
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 text-xs text-on-surface-variant space-y-2 leading-relaxed">
                <p>
                  {selectedOfferForModal.termsAndConditions ||
                    'Standard Roomly reservation policies apply. Applicable on all direct website bookings paid with eligible credit card. One offer redemption per customer per booking session.'}
                </p>
                <ul className="list-disc list-inside space-y-1 pt-1 text-[11px] text-on-surface-variant/90">
                  <li>Valid exclusively when paying with {selectedOfferForModal.bankName} {selectedOfferForModal.cardNetwork} cards.</li>
                  <li>Minimum stay valuation must meet or exceed {formatCurrency(selectedOfferForModal.minBookingAmount)}.</li>
                  <li>Discount is automatically validated and applied against the eligible room reservation subtotal on the Checkout page.</li>
                  <li>Not combinable with unverified external third-party coupons.</li>
                  <li>Demonstration offer simulated for test reservations.</li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-on-surface-variant">
                Select your room to apply this offer during checkout.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOfferForModal(null)}
                  className="w-full sm:w-auto text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const offer = selectedOfferForModal;
                    setSelectedOfferForModal(null);
                    handleBookNow(offer);
                  }}
                  className="w-full sm:w-auto text-xs font-bold"
                >
                  Book a Room with this Offer
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
