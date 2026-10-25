import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRoom } from '../../features/rooms/hooks';
import { formatCurrency, calculateNights } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import {
  Star,
  Users,
  Maximize2,
  Bed,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Share2,
  Heart,
  Sparkles,
  Clock,
  Ban,
  MapPin,
  Building2,
  MessageSquare,
  ThumbsUp,
  Check,
} from 'lucide-react';

export const RoomDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: room, isLoading } = useRoom(id || 'room-101');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('2026-10-15');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-19');
  const [guestCount, setGuestCount] = useState('2');
  const [savedWishlist, setSavedWishlist] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      author: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: 'September 2026',
      title: 'Architectural perfection with impeccable concierge attention',
      comment: 'From the private express check-in to the breathtaking panoramic city view, every detail was thought through. The marble soaking tub and soundproofing made it the most peaceful stay I have had all year.',
      verifiedStay: true,
      likes: 14,
    },
    {
      id: 'rev-2',
      author: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      date: 'August 2026',
      title: 'A true 5-star sanctuary',
      comment: 'The bedding and linen quality is supreme. Waking up to sunset cocktails delivered by personal butler service was unmatched. Will definitely return on my next vacation.',
      verifiedStay: true,
      likes: 9,
    },
  ]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newAuthor.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: newRating,
      date: 'October 2026',
      title: newTitle.trim() || 'Remarkable Hospitality & Comfort',
      comment: newComment.trim(),
      verifiedStay: true,
      likes: 1,
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setNewTitle('');
    setNewComment('');
    setNewAuthor('');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="w-1/3 h-8" />
        <Skeleton className="w-full h-[480px] rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-32" />
          </div>
          <Skeleton className="w-full h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">Suite Not Found</h2>
        <p className="text-sm text-on-surface-variant">The requested accommodation is currently unavailable.</p>
        <Link to="/rooms">
          <Button variant="primary">Return to Available Rooms</Button>
        </Link>
      </div>
    );
  }

  const nights = calculateNights(checkInDate, checkOutDate);
  const basePrice = room.pricePerNight * nights;
  const taxes = Math.round(basePrice * 0.12);
  const serviceFee = 45;
  const totalPrice = basePrice + taxes + serviceFee;

  const handleProceedToCheckout = () => {
    navigate(
      `/checkout?roomId=${room.id}&in=${checkInDate}&out=${checkOutDate}&guests=${guestCount}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <Link to="/rooms" className="hover:text-primary">Rooms</Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <Link to={`/rooms?location=${room.location}`} className="text-primary hover:underline">{room.location}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span className="text-on-surface font-bold">{room.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSavedWishlist(!savedWishlist)}
            className={`p-2 rounded-xl border border-outline-variant/60 hover:bg-surface-container transition-colors ${
              savedWishlist ? 'text-error bg-error-container/40' : 'text-on-surface-variant'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${savedWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className={`p-2 rounded-xl border border-outline-variant/60 hover:bg-surface-container transition-colors ${
              copiedLink ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'text-on-surface-variant'
            }`}
            title={copiedLink ? "Link Copied!" : "Share Suite"}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
              {room.type}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {room.location}
            </span>
            <StatusBadge status={room.status} />
            <span className="flex items-center gap-1 text-xs font-bold text-on-surface">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {room.rating} <span className="text-on-surface-variant font-normal">({room.reviewCount} reviews)</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            {room.title}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5 font-medium">
            <Building2 className="w-4 h-4 text-primary" />
            <span>{room.hotelName} • Floor {room.floor} • Room #{room.roomNumber}</span>
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main large image */}
        <div className="lg:col-span-3 aspect-[16/10] rounded-3xl overflow-hidden shadow-md border border-outline-variant/60 relative">
          <img
            src={room.images[activeImageIndex] || room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-4 left-4 bg-on-surface/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-white">
            Photo {activeImageIndex + 1} of {room.images.length}
          </div>
        </div>

        {/* Thumbnail stack */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
          {room.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all ${
                activeImageIndex === idx
                  ? 'border-primary ring-2 ring-primary/30 shadow-md scale-[1.02]'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content & Sticky Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Specs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-center">
            <div>
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-on-surface-variant">Capacity</p>
              <p className="text-sm font-bold text-on-surface">{room.capacity} Guests</p>
            </div>
            <div>
              <Maximize2 className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-on-surface-variant">Space Size</p>
              <p className="text-sm font-bold text-on-surface">{room.sizeSqFt} sq ft</p>
            </div>
            <div>
              <Bed className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-on-surface-variant">Bed Type</p>
              <p className="text-sm font-bold text-on-surface truncate">{room.bedType}</p>
            </div>
            <div>
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-on-surface-variant">Location City</p>
              <p className="text-sm font-bold text-on-surface">{room.location}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">About This Suite</h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {room.description}
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Located at {room.hotelName} in {room.location}, this suite is crafted for travelers seeking serenity, convenience, and bespoke service.
            </p>
          </div>

          {/* Full Amenities Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">Luxury Room Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-sm font-medium text-on-surface"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Policies */}
          <div className="space-y-4 pt-6 border-t border-outline-variant/60">
            <h2 className="text-2xl font-bold text-on-surface">Stay Policies & Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-on-surface-variant">
              <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                <Clock className="w-4 h-4 text-primary mb-1" />
                <p className="font-bold text-on-surface">Check-in / Check-out</p>
                <p>Check-in: 3:00 PM</p>
                <p>Check-out: 12:00 PM</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                <Ban className="w-4 h-4 text-error mb-1" />
                <p className="font-bold text-on-surface">Smoke Free Facility</p>
                <p>100% smoke-free property</p>
                <p>Designated terrace zones only</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                <ShieldCheck className="w-4 h-4 text-secondary mb-1" />
                <p className="font-bold text-on-surface">Free Cancellation</p>
                <p>Cancel up to 48 hours prior</p>
                <p>100% full refund guarantee</p>
              </div>
            </div>
          </div>

          {/* Verified Guest Reviews & Ratings Section */}
          <div className="space-y-6 pt-6 border-t border-outline-variant/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                  <span>Guest Reviews & Ratings</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {reviews.length} Verified
                  </span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-sm text-on-surface">{room.rating || 4.9} out of 5.0</span>
                  <span className="text-xs text-on-surface-variant">• 100% of guests recommend this suite</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                onClick={() => setIsReviewModalOpen(true)}
              >
                Write a Review
              </Button>
            </div>

            {/* Individual Reviews Cards */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/50"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-on-surface">{rev.author}</p>
                          {rev.verifiedStay && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Verified Guest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant">{rev.date}</p>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-on-surface">{rev.title}</h4>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/40">
                    <span>Stayed in {room.title}</span>
                    <button
                      onClick={() => {
                        setReviews(
                          reviews.map((r) => (r.id === rev.id ? { ...r, likes: r.likes + 1 } : r))
                        );
                      }}
                      className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({rev.likes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Calculator */}
        <div>
          <div className="sticky top-24 bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/60 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <span className="text-3xl font-black text-on-surface">
                  {formatCurrency(room.pricePerNight)}
                </span>
                <span className="text-xs text-on-surface-variant font-medium"> / night</span>
              </div>
              <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Best Rate Guaranteed
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-transparent font-semibold text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-transparent font-semibold text-xs text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full bg-transparent font-semibold text-xs text-on-surface focus:outline-none"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-on-surface-variant pt-2">
              <div className="flex justify-between">
                <span>{formatCurrency(room.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="font-semibold text-on-surface">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Occupancy Taxes & Tourism Levy (12%)</span>
                <span className="font-semibold text-on-surface">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort & Concierge Fee</span>
                <span className="font-semibold text-on-surface">{formatCurrency(serviceFee)}</span>
              </div>
              <div className="border-t border-outline-variant/50 pt-3 flex justify-between text-base font-bold text-on-surface">
                <span>Total Due</span>
                <span className="text-xl text-primary font-black">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleProceedToCheckout}
              size="lg"
              variant="primary"
              className="w-full py-4 text-base font-bold shadow-lg"
            >
              Book Now
            </Button>

            <p className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              You won't be charged until reservation confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Share Your Guest Experience"
        size="md"
      >
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Your Star Rating
            </label>
            <div className="flex gap-2 text-amber-400 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= newRating ? 'fill-current' : 'text-outline/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Review Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Unparalleled luxury and sunset views"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Review Details
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell other travelers about the suite, bed comfort, staff service, or amenities..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
